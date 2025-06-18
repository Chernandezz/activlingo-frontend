// core/services/auth.service.ts - VERSIÓN SIN ROUTER
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { supabase } from '../utils/supabase-client';
import { of } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name?: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private async initializeAuth(): Promise<void> {
    try {
      console.log('Initializing auth...');

      // Verificar sesión de Supabase primero
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('Initial session check:', session);

      if (session?.user) {
        console.log('Session found, setting user');
        this.setUserPrivate(session.user);
        if (session.access_token) {
          localStorage.setItem('access_token', session.access_token);
        }
        if (session.refresh_token) {
          localStorage.setItem('refresh_token', session.refresh_token);
        }
        return;
      }

      // Verificar token local como fallback
      const token = localStorage.getItem('access_token');
      if (token && !this.isTokenExpired(token)) {
        console.log('Local token found and valid');
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.setUserPrivate({
          id: payload.sub || payload.id,
          email: payload.email,
          name: payload.name || '',
        });
      }

      // Escuchar cambios de Supabase
      supabase.auth.onAuthStateChange((event, session) => {
        console.log(
          '🔥 Supabase auth state change:',
          event,
          session?.user?.email
        );

        if (event === 'SIGNED_IN' && session) {
          console.log('✅ User signed in via Supabase');
          this.setUserPrivate(session.user);
          if (session.access_token) {
            localStorage.setItem('access_token', session.access_token);
          }
          if (session.refresh_token) {
            localStorage.setItem('refresh_token', session.refresh_token);
          }

          // 🔧 QUITAR LA NAVEGACIÓN AUTOMÁTICA DEL SERVICE
          // La navegación la manejará el componente o guard
        } else if (event === 'SIGNED_OUT') {
          console.log('❌ User signed out');
          this.clearAuth();
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        console.log('Login response:', response);

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

  // 🔄 Logout que retorna Promise para compatibilidad
  async logout(): Promise<void> {
    try {
      await this.performLogout();
    } catch (error) {
      console.warn('Logout error:', error);
      // Aún así limpiar - el logout siempre debe "funcionar" desde la perspectiva del usuario
      this.clearAuth();
    }
  }

  // También mantener versión Observable para compatibilidad
  logoutObservable(): Observable<any> {
    return of(null).pipe(
      tap(() => {
        this.performLogout();
      })
    );
  }

  private async performLogout(): Promise<void> {
    console.log('🔄 Starting logout process...');

    try {
      // Logout de Supabase
      console.log('📤 Signing out from Supabase...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('⚠️ Supabase logout error:', error);
      } else {
        console.log('✅ Supabase logout successful');
      }
    } catch (error) {
      console.warn('⚠️ Supabase logout exception:', error);
    }

    // Siempre limpiar el estado local
    console.log('🧹 Clearing local auth state...');
    this.clearAuth();
    console.log('✅ Logout process completed');
  }

  // 🆕 Método público para setear usuario (usado por callback)
  setUser(user: any): void {
    this.setUserPrivate(user);
  }

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

    console.log('Setting user:', formattedUser);
    this.userSubject.next(formattedUser);
  }

  private clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.userSubject.next(null);
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

  // Para debug
  getAuthState(): any {
    return {
      user: this.currentUser,
      hasToken: Boolean(localStorage.getItem('access_token')),
      isLoggedIn: this.isLoggedIn(),
    };
  }
}
