import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { supabase } from '../../../../core/utils/supabase-client';
import { Subject, debounceTime, takeUntil } from 'rxjs';

interface ValidationMessage {
  type: 'error' | 'success' | 'warning';
  text: string;
}

interface LoadingStates {
  login: boolean;
  signup: boolean;
  resetPassword: boolean;
  googleAuth: boolean;
  facebookAuth: boolean;
}

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth-page.component.html',
})
export class AuthPageComponent implements OnInit, OnDestroy {
  // Form data
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  // UI states
  isLogin = true;
  showConfirmationNotice = false;
  showPassword = false;
  showConfirmPassword = false;

  // Loading states
  loadingStates: LoadingStates = {
    login: false,
    signup: false,
    resetPassword: false,
    googleAuth: false,
    facebookAuth: false,
  };

  // Messages and validation
  message = '';
  validationMessage: ValidationMessage | null = null;

  // RxJS subjects for debounced validation
  private emailSubject = new Subject<string>();
  private passwordSubject = new Subject<string>();
  private confirmPasswordSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Password strength
  passwordStrength: 'weak' | 'medium' | 'strong' | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    // Check if user is already logged in
    await this.checkExistingSession();

    // Setup debounced validation
    this.setupValidationSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============= INITIALIZATION METHODS =============

  private async checkExistingSession(): Promise<void> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        this.router.navigate(['/chat']);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  private setupValidationSubscriptions(): void {
    // Email validation with debounce
    this.emailSubject
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe((email) => {
        this.validateField('email');
      });

    // Password validation with debounce
    this.passwordSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((password) => {
        this.validateField('password');
        this.checkPasswordStrength(password);
      });

    // Confirm password validation with debounce
    this.confirmPasswordSubject
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.validateField('confirmPassword');
      });
  }

  // ============= COMPUTED PROPERTIES =============

  get isLoading(): boolean {
    return Object.values(this.loadingStates).some((state) => state);
  }

  get currentLoadingText(): string {
    if (this.loadingStates.login) return 'Iniciando sesión...';
    if (this.loadingStates.signup) return 'Creando cuenta...';
    if (this.loadingStates.resetPassword) return 'Enviando email...';
    if (this.loadingStates.googleAuth) return 'Conectando con Google...';
    if (this.loadingStates.facebookAuth) return 'Conectando con Facebook...';
    return 'Procesando...';
  }

  // ============= VALIDATION METHODS =============

  isFormValid(): boolean {
    if (this.isLogin) {
      return (
        Boolean(this.email) &&
        Boolean(this.password) &&
        this.isValidEmail(this.email) &&
        this.validationMessage === null
      );
    } else {
      return (
        Boolean(this.name.trim()) &&
        Boolean(this.email) &&
        Boolean(this.password) &&
        Boolean(this.confirmPassword) &&
        this.password === this.confirmPassword &&
        this.isValidEmail(this.email) &&
        this.isValidPassword(this.password) &&
        this.validationMessage === null
      );
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  validateField(field: string): void {
    this.validationMessage = null;

    switch (field) {
      case 'email':
        if (this.email && !this.isValidEmail(this.email)) {
          this.validationMessage = {
            type: 'error',
            text: 'Por favor ingresa un email válido',
          };
        }
        break;

      case 'password':
        if (this.password && !this.isValidPassword(this.password)) {
          this.validationMessage = {
            type: 'error',
            text: 'La contraseña debe tener al menos 8 caracteres',
          };
        }
        break;

      case 'confirmPassword':
        if (
          !this.isLogin &&
          this.confirmPassword &&
          this.password !== this.confirmPassword
        ) {
          this.validationMessage = {
            type: 'error',
            text: 'Las contraseñas no coinciden',
          };
        }
        break;

      case 'name':
        if (!this.isLogin && this.name && this.name.trim().length < 2) {
          this.validationMessage = {
            type: 'error',
            text: 'El nombre debe tener al menos 2 caracteres',
          };
        }
        break;
    }
  }

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = null;
      return;
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      this.passwordStrength = 'weak';
    } else if (score <= 4) {
      this.passwordStrength = 'medium';
    } else {
      this.passwordStrength = 'strong';
    }
  }

  // ============= INPUT EVENT HANDLERS =============

  onEmailChange(): void {
    this.emailSubject.next(this.email);
  }

  onPasswordChange(): void {
    this.passwordSubject.next(this.password);
  }

  onConfirmPasswordChange(): void {
    this.confirmPasswordSubject.next(this.confirmPassword);
  }

  onNameChange(): void {
    if (!this.isLogin) {
      this.validateField('name');
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.isFormValid() && !this.isLoading) {
      event.preventDefault();
      this.submit();
    }
  }

  // ============= UI TOGGLE METHODS =============

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.clearForm();
    this.clearMessages();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // ============= FORM METHODS =============

  clearForm(): void {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.passwordStrength = null;
  }

  clearMessages(): void {
    this.message = '';
    this.validationMessage = null;
  }

  resetLoadingStates(): void {
    this.loadingStates = {
      login: false,
      signup: false,
      resetPassword: false,
      googleAuth: false,
      facebookAuth: false,
    };
  }

  // ============= AUTHENTICATION METHODS =============

  submit(): void {
    if (!this.isFormValid() || this.isLoading) {
      return;
    }

    // Clear previous messages
    this.clearMessages();

    // Validate passwords match for signup
    if (!this.isLogin && this.password !== this.confirmPassword) {
      this.message = 'Las contraseñas no coinciden';
      return;
    }

    if (this.isLogin) {
      this.handleLogin();
    } else {
      this.handleSignup();
    }
  }

  private handleLogin(): void {
    this.loadingStates.login = true;

    this.authService
      .login({
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.message = 'Inicio de sesión exitoso';
          setTimeout(() => {
            this.router.navigate(['/chat']);
          }, 1000);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.message = this.getErrorMessage(err);
          this.loadingStates.login = false;
        },
        complete: () => {
          // Loading state will be reset on successful navigation
        },
      });
  }

  private handleSignup(): void {
    this.loadingStates.signup = true;

    this.authService
      .signup({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.message = 'Cuenta creada exitosamente';
          this.showConfirmationNotice = true;
          this.clearForm();
        },
        error: (err) => {
          console.error('Signup error:', err);
          this.message = this.getErrorMessage(err);
        },
        complete: () => {
          this.loadingStates.signup = false;
        },
      });
  }

  async sendResetPasswordEmail(): Promise<void> {
    if (!this.email) {
      this.message =
        'Por favor ingresa tu email para restablecer la contraseña';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.message = 'Por favor ingresa un email válido';
      return;
    }

    this.loadingStates.resetPassword = true;
    this.clearMessages();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        this.email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-confirmed`,
        }
      );

      if (error) throw error;

      this.message =
        'Email de restablecimiento enviado. Revisa tu bandeja de entrada.';
      this.validationMessage = {
        type: 'success',
        text: 'Revisa tu email para restablecer la contraseña',
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      this.message = 'Error al enviar el email de restablecimiento';
    } finally {
      this.loadingStates.resetPassword = false;
    }
  }

  goToLogin(): void {
    this.showConfirmationNotice = false;
    if (!this.isLogin) {
      this.toggleMode();
    }
    this.clearMessages();
  }

  // ============= SOCIAL AUTHENTICATION =============

  async loginWithGoogle(): Promise<void> {
    this.loadingStates.googleAuth = true;
    this.clearMessages();

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // Note: The actual redirect will happen automatically
      // This code might not execute if redirect is immediate
    } catch (error: any) {
      console.error('Google auth error:', error);
      this.message = 'Error al iniciar sesión con Google';
      this.loadingStates.googleAuth = false;
    }
  }

  async loginWithFacebook(): Promise<void> {
    this.loadingStates.facebookAuth = true;
    this.clearMessages();

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });

      if (error) throw error;

      // Note: The actual redirect will happen automatically
    } catch (error: any) {
      console.error('Facebook auth error:', error);
      this.message = 'Error al iniciar sesión con Facebook';
      this.loadingStates.facebookAuth = false;
    }
  }

  // ============= UTILITY METHODS =============

  private getErrorMessage(error: any): string {
    // Map common error messages to user-friendly Spanish messages
    const errorMessages: { [key: string]: string } = {
      'Invalid login credentials': 'Credenciales incorrectas',
      'Email not confirmed':
        'Email no confirmado. Revisa tu bandeja de entrada.',
      'User already registered': 'El usuario ya está registrado',
      'Password should be at least 6 characters':
        'La contraseña debe tener al menos 6 caracteres',
      'Invalid email': 'Email inválido',
      'Network error': 'Error de conexión. Intenta nuevamente.',
    };

    const errorDetail =
      error.error?.detail || error.message || 'Error desconocido';
    return errorMessages[errorDetail] || `Error: ${errorDetail}`;
  }

  // ============= ACCESSIBILITY METHODS =============

  getAriaLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre completo requerido',
      email: 'Dirección de correo electrónico requerida',
      password: 'Contraseña requerida, mínimo 8 caracteres',
      confirmPassword: 'Confirmar contraseña',
    };
    return labels[field] || '';
  }

  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 'weak':
        return 'Contraseña débil';
      case 'medium':
        return 'Contraseña moderada';
      case 'strong':
        return 'Contraseña fuerte';
      default:
        return '';
    }
  }

  getPasswordStrengthColor(): string {
    switch (this.passwordStrength) {
      case 'weak':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'strong':
        return 'text-green-500';
      default:
        return '';
    }
  }
}
