// core/services/auth.service.ts - VERSIÓN CORREGIDA
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { supabase } from '../utils/supabase-client';
import { of } from 'rxjs';
import { LoginRequest, SignUpRequest } from '../models/auth.model';
import { UserService } from './user.service';
import { SubscriptionService } from './subscription.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();

  // 🔧 NO marcar como resuelto hasta que termine la inicialización
  isAuthResolved$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private subscriptionService: SubscriptionService
  ) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Verificar sesión de Supabase primero
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        this.setUserPrivate(session.user);
        if (session.access_token) {
          localStorage.setItem('access_token', session.access_token);
        }
        if (session.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }
      } else {
        // Verificar token local como fallback
        const token = localStorage.getItem('access_token');
        if (token && !this.isTokenExpired(token)) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.setUserPrivate({
            id: payload.sub || payload.id,
            email: payload.email,
            name: payload.name || '',
          });
        }
      }

      // Escuchar cambios de Supabase
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          this.setUserPrivate(session.user);
          if (session.access_token) {
            localStorage.setItem('access_token', session.access_token);
          }
          if (session.refresh_token) {
            localStorage.setItem('refresh_token', session.refresh_token);
          }
        } else if (event === 'SIGNED_OUT') {
          this.clearAuth();
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      this.isAuthResolved$.next(true);
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }

        if (response.user) {
          this.setUser(response.user);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  signup(data: SignUpRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/signup`, data).pipe(
      catchError((error) => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await this.performLogout();
    } catch (error) {
      console.warn('Logout error:', error);
      this.clearAuth();
    }
  }

  logoutObservable(): Observable<any> {
    return of(null).pipe(
      tap(() => {
        this.performLogout();
      })
    );
  }

  private async performLogout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    this.clearAuth();
  }

  setUser(user: any): void {
    this.setUserPrivate(user);
  }

  // MODIFICAR el método setUserPrivate:
  private setUserPrivate(user: any): void {
    if (!user) return;

    const formattedUser = {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.name ||
        '',
      avatar_url: user.user_metadata?.avatar_url || '',
    };

    this.userSubject.next(formattedUser);

    // ✅ AGREGAR: Pre-cargar datos cuando se establece el usuario
    this.userService.preloadUserData().subscribe();
  }

  private clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userSubject.next(null);

    // ✅ AGREGAR: Limpiar cache al hacer logout
    this.userService.clearCache();
    this.subscriptionService.clearCache(); // ✅ AGREGAR
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  get currentUser(): any {
    return this.userSubject.getValue();
  }

  get currentUserId(): string | null {
    return this.currentUser?.id || null;
  }

  isLoggedIn(): boolean {
    const user = this.currentUser;
    const token = localStorage.getItem('access_token');
    return Boolean(user && token && !this.isTokenExpired(token));
  }

  // 🆕 Método para verificar si está autenticado (usado por guards)
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }

  getAuthState(): any {
    return {
      user: this.currentUser,
      hasToken: Boolean(localStorage.getItem('access_token')),
      isLoggedIn: this.isLoggedIn(),
    };
  }
}
