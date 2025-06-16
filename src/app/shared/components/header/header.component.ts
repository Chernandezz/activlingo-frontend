import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBookOpen, faComments } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../core/services/auth.service';
import { faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  faUser = faUser;
  showUserMenu = false;
  isMobileSidebarOpen = false;

  faBookOpen = faBookOpen;
  faComments = faComments;

  userStats = {
    streak: 5,
    level: 'Intermediate',
    chats: 23,
  };

  constructor(
    public ui: UiService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

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
      // Opcional: navegar a auth de todas formas
      this.router.navigate(['/auth']);
    }
  }
  viewProfile(): void {
    this.closeUserMenu();
    console.log('View profile...');
  }

  viewSettings(): void {
    this.closeUserMenu();
    console.log('View settings...');
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
