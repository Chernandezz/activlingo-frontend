// src/app/core/services/user.service.ts - ACTUALIZADO
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiProfileResponse, UpdateProfileRequest } from '../models/profile.model';
import { UserStats } from '../models/user.model';
import { Achievement } from '../models/achievement.model';
import { PlanInfo, TrialStatus, UserInfo } from '../models/user-legacy.model';



@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  // ========== NUEVOS MÉTODOS ==========

  // ✅ ACTUALIZADO PARA MANEJAR LA RESPUESTA CORRECTA
  getFullProfile(): Observable<ApiProfileResponse> {
    return this.http.get<ApiProfileResponse>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  getAchievements(): Observable<{
    achievements: Achievement[];
    total_unlocked: number;
  }> {
    return this.http.get<{
      achievements: Achievement[];
      total_unlocked: number;
    }>(`${this.apiUrl}/achievements`);
  }

  // ========== MÉTODOS LEGACY (mantener compatibilidad) ==========

  getTrialInfo(): Observable<TrialStatus> {
    return this.http.get<TrialStatus>(`${this.apiUrl}/trial-status`);
  }

  markOnboardingSeen(): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding-seen`, {});
  }

  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/profile`);
  }

  getPlanInfo(): Observable<PlanInfo> {
    return this.http.get<PlanInfo>(`${this.apiUrl}/plan-info`);
  }

  updateSubscriptionPlan(planType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-plan`, {
      subscription_type: planType,
    });
  }

  hasPremiumAccess(): Observable<{ has_premium: boolean; plan_type: string }> {
    return this.http.get<{ has_premium: boolean; plan_type: string }>(
      `${this.apiUrl}/premium-access`
    );
  }

  // ========== UTILIDADES ==========

  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  calculateDaysAgo(dateString: string): number {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }

  calculateLevelProgress(totalConversations: number): number {
    // Lógica para calcular progreso basado en conversaciones
    const currentLevelBase = Math.floor(totalConversations / 10) * 10;
    const nextLevelBase = currentLevelBase + 10;
    const progress =
      ((totalConversations - currentLevelBase) /
        (nextLevelBase - currentLevelBase)) *
      100;
    return Math.min(progress, 100);
  }

  getLevel(totalConversations: number): string {
    if (totalConversations < 10) return 'Principiante';
    if (totalConversations < 50) return 'Intermedio';
    if (totalConversations < 100) return 'Avanzado';
    return 'Experto';
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
}
