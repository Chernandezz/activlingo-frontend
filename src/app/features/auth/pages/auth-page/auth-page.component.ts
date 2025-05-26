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
  email = '';
  password = '';
  isLogin = true;
  isLoading = false;
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.message = '';
  }

  submit() {
    this.isLoading = true;
    if (this.isLogin) {
      this.authService
        .login({ email: this.email, password: this.password })
        .subscribe({
          next: (res) => {
            this.message = 'Login successful'; // ✅ login
            this.isLoading = false;
            this.router.navigate(['/chat']); // ✅ redirigir
          },
          error: (err) => {
            this.message = err.error?.detail || 'Login failed';
            this.isLoading = false;
          },
        });
    } else {
      this.authService
        .signup({ email: this.email, password: this.password })
        .subscribe({
          next: (res) => {
            this.message = 'Signup successful';
            this.isLoading = false;
            this.toggleMode();
          },
          error: (err) => {
            this.message = err.error?.detail || 'Signup failed';
            this.isLoading = false;
          },
        });
    }
  }
}
