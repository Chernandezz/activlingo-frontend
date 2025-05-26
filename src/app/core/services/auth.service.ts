import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, SignUpRequest, AuthResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  private userSubject = new BehaviorSubject<any | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        this.userSubject.next(res.user);
      })
    );
  }

  signup(data: SignUpRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/signup`, data);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      return Date.now() >= exp * 1000;
    } catch (e) {
      return true;
    }
  }

  logout(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const params = new HttpParams().set('token', token || '');
    return this.http
      .post<any>(`${this.apiUrl}/auth/logout`, null, { params })
      .pipe(
        tap(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          this.userSubject.next(null);
        })
      );
  }

  get getCurrentUser(): string | null {
    return this.userSubject.getValue()?.id || null;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
}
