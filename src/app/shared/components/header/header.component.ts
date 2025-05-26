import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBookOpen, faComments } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  userName = 'Cristian';
  showUserMenu = false;
  isMobileSidebarOpen = false;

  faBookOpen = faBookOpen;
  faComments = faComments;

  userStats = {
    streak: 5,
    level: 'Intermediate',
    chats: 23,
  };

  constructor(public ui: UiService, private router: Router) {}

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

  logout(): void {
    this.closeUserMenu();
    console.log('Logging out...');
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
