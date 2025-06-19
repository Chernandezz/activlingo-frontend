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
import { catchError } from 'rxjs/operators';
import { UserStats } from '../../../core/models/user.model';

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
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // ✅ Solo cargar si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      this.loadUserStats();
    } else {
      // ✅ Si no está autenticado, usar valores por defecto sin loading
      this.userStats.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserStats(): void {
    // ✅ Solo obtener estadísticas del usuario
    this.userService
      .getStats()
      .pipe(
        catchError(() => of(this.getDefaultStats())),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (stats: UserStats) => {
          this.userStats = {
            streak: stats.current_streak || 0,
            words: stats.total_words_learned || 0,
            chats: stats.total_conversations || 0,
            isLoading: false,
          };
        },
        error: (error: any) => {
          console.warn('Error loading user stats:', error);
          // ✅ No resetear, mantener valores por defecto
          this.userStats.isLoading = false;
        },
      });
  }

  private getDefaultStats(): UserStats {
    return {
      total_conversations: 0,
      current_streak: 0,
      longest_streak: 0,
      total_words_learned: 0,
      average_session_minutes: 0,
      join_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      conversations_this_month: 0,
      words_learned_this_month: 0,
    };
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
