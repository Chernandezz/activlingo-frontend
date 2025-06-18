// src/app/core/services/user.service.ts - COMPLETAMENTE NUEVO Y LIMPIO
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserProfile,
  UserStats,
  Achievement,
  UpdateProfileRequest,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  // ========== PERFIL ==========

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/profile`, data);
  }

  // ========== ESTADÍSTICAS ==========

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  // ========== LOGROS ==========

  getAchievements(): Observable<{
    achievements: Achievement[];
    total_unlocked: number;
  }> {
    return this.http.get<{
      achievements: Achievement[];
      total_unlocked: number;
    }>(`${this.apiUrl}/achievements`);
  }

  // ========== ONBOARDING ==========

  markOnboardingCompleted(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/onboarding-seen`,
      {}
    );
  }

  // ========== UTILIDADES ==========

  formatDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';

    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  calculateDaysAgo(dateString: string): number {
    if (!dateString) return 0;

    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  getUserLevel(totalConversations: number): string {
    if (totalConversations < 10) return 'Principiante';
    if (totalConversations < 50) return 'Intermedio';
    if (totalConversations < 100) return 'Avanzado';
    return 'Experto';
  }

  getLevelProgress(totalConversations: number): number {
    const currentLevelBase = Math.floor(totalConversations / 10) * 10;
    const nextLevelBase = currentLevelBase + 10;
    const progress =
      ((totalConversations - currentLevelBase) /
        (nextLevelBase - currentLevelBase)) *
      100;
    return Math.min(progress, 100);
  }

  getStreakIcon(streak: number): string {
    if (streak >= 30) return 'fas fa-crown';
    if (streak >= 7) return 'fas fa-fire';
    return 'fas fa-calendar-check';
  }

  getStreakColor(streak: number): string {
    if (streak >= 30) return 'text-yellow-500';
    if (streak >= 7) return 'text-orange-500';
    return 'text-blue-500';
  }

  getUserInitials(name?: string, email?: string): string {
    if (name?.trim()) {
      return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return 'U';
  }

  getDisplayName(name?: string, email?: string): string {
    if (name?.trim()) {
      return name;
    }

    if (email) {
      return email.split('@')[0];
    }

    return 'Usuario';
  }
}
