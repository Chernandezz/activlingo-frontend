// src/app/shared/components/header/header.component.ts - CORREGIDO
import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBookOpen,
  faComments,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Subject, takeUntil, of } from 'rxjs';

// ✅ NUEVO: Importar servicios del chat
import { ChatService } from '../../../features/chat/services/chat.service';
import { MessageService } from '../../../features/chat/services/message.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  faUser = faUser;
  faBookOpen = faBookOpen;
  faComments = faComments;

  showUserMenu = false;
  isMobileSidebarOpen = false;

  // ✅ Estado simplificado
  userStats = {
    streak: 0,
    words: 0,
    chats: 0,
    isLoading: true,
  };

  private destroy$ = new Subject<void>();

  constructor(
    public ui: UiService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    // ✅ NUEVO: Inyectar servicios del chat
    private chatService: ChatService,
    private messageService: MessageService
  ) {}

  // REEMPLAZAR todo el método ngOnInit:
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      // ✅ USAR stats del perfil en lugar de stats separados
      this.userService.userProfile$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (profile) => {
          if (profile?.stats) {
            this.userStats = {
              streak: profile.stats.current_streak || 0,
              words: profile.stats.total_words_learned || 0,
              chats: profile.stats.total_conversations || 0,
              isLoading: false,
            };
          }
        },
      });

      // Triggear carga del perfil si no está cacheado
      this.userService.getProfile().subscribe();
    } else {
      this.userStats.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ NUEVO: Método para ir al catálogo y cerrar chat
  goToConversations(): void {
    // 1. Cerrar chat actual si existe
    this.chatService.setCurrentChat(null);

    // 2. Limpiar mensajes
    this.messageService.clearMessages();

    // 3. Cerrar sidebar móvil si está abierto
    this.ui.closeSidebar();

    // 4. Navegar a /chat (que mostrará el welcome view)
    this.router.navigate(['/chat']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.showUserMenu) {
      const target = event.target as HTMLElement;
      const userMenuElement = document.querySelector('.dropdown-menu');
      const userButtonElement = document.querySelector('.user-button');

      if (
        userMenuElement &&
        userButtonElement &&
        !userMenuElement.contains(target) &&
        !userButtonElement.contains(target)
      ) {
        this.closeUserMenu();
      }
    }
  }

  toggleSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.closeUserMenu();
      this.router.navigate(['/auth']);
    } catch (err) {
      console.error('Logout failed:', err);
      this.closeUserMenu();
      this.router.navigate(['/auth']);
    }
  }

  viewProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/profile']);
  }

  viewSettings(): void {
    this.closeUserMenu();
    this.router.navigate(['/profile'], { fragment: 'settings' });
  }

  getUserInitials(name: string): string {
    if (!name || name.trim() === '') {
      return 'U';
    }

    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getUserName(): string {
    const currentUser = this.authService.currentUser;
    return currentUser?.name || currentUser?.email || 'Usuario';
  }

  // ✅ Método para mostrar racha con loading
  getDisplayStreak(): string | number {
    if (this.userStats.isLoading) {
      return '...';
    }
    return this.userStats.streak;
  }

  // ✅ Método para mostrar chats con loading
  getDisplayChats(): string | number {
    if (this.userStats.isLoading) {
      return '...';
    }
    return this.userStats.chats;
  }

  // ✅ Método para mostrar palabras con loading
  getDisplayWords(): string | number {
    if (this.userStats.isLoading) {
      return '...';
    }
    return this.userStats.words;
  }
}
