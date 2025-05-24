// header.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  currentRoute = 'chat';
  userName = 'Cristian';
  userInitials = 'C';
  showUserMenu = false;

  // Simulated user data
  userStats = {
    streak: 5,
    level: 'Intermediate',
    chats: 23,
  };

  constructor() {}

  ngOnInit(): void {
    // Initialize component
    this.updateCurrentRoute();
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

  updateCurrentRoute(): void {
    // Detect current route - you can implement this based on your routing
    // For now, we'll keep it simple
    this.currentRoute = 'chat';
  }

  navigateToLearning(): void {
    this.currentRoute = 'learning';
    // Implement navigation logic here
    console.log('Navigate to learning...');
  }

  navigateToChat(): void {
    this.currentRoute = 'chat';
    // Implement navigation logic here
    console.log('Navigate to chat...');
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  logout(): void {
    this.closeUserMenu();
    // Implement logout logic
    console.log('Logging out...');
  }

  viewProfile(): void {
    this.closeUserMenu();
    // Navigate to profile
    console.log('View profile...');
  }

  viewSettings(): void {
    this.closeUserMenu();
    // Navigate to settings
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

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
}
