import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.component.html',
})
export class AuthPageComponent {
  showConfirmationNotice = false;

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLogin = true;
  isLoading = false;
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.message = '';
  }

  submit() {
    if (!this.isLogin && this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }

    this.isLoading = true;

    if (this.isLogin) {
      this.authService
        .login({ email: this.email, password: this.password })
        .subscribe({
          next: () => {
            this.message = 'Login successful';
            this.isLoading = false;
            this.router.navigate(['/chat']);
          },
          error: (err) => {
            this.message = err.error?.detail || 'Login failed';
            this.isLoading = false;
          },
        });
    } else {
      this.authService
        .signup({ name: this.name, email: this.email, password: this.password })
        .subscribe({
          next: () => {
            this.message = 'Signup successful';
            this.isLoading = false;
            this.showConfirmationNotice = true;
            this.toggleMode();
          },
          error: (err) => {
            this.message = err.error?.detail || 'Signup failed';
            this.isLoading = false;
          },
        });
    }
  }
  goToLogin() {
    this.showConfirmationNotice = false;
    this.toggleMode();
  }
}
