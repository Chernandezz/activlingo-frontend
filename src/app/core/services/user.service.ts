// src/app/core/services/user.service.ts - ACTUALIZADO
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

// ========== INTERFACES ACTUALIZADAS ==========

export interface UserStats {
  total_conversations: number;
  current_streak: number;
  longest_streak: number;
  total_words_learned: number;
  average_session_minutes: number;
  join_date: string;
  last_activity: string;
  conversations_this_month: number;
  words_learned_this_month: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target_value: number;
  current_progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    created_at: string;
  };
  subscription: {
    id: number;
    user_id: string;
    plan: {
      id: number;
      name: string;
      slug: string;
      price: number;
      currency: string;
      billing_interval: string;
      features: string[];
      max_conversations: number;
      max_words_per_day: number;
      priority_support: boolean;
    };
    status: string;
    starts_at: string;
    ends_at?: string;
    trial_ends_at?: string;
    canceled_at?: string;
  } | null;
  stats: UserStats;
}

// ✅ NUEVA INTERFAZ PARA LA RESPUESTA DEL BACKEND
export interface ApiProfileResponse {
  success: boolean;
  profile: UserProfileResponse;
}

export interface UpdateProfileRequest {
  name?: string;
  language?: string;
  learning_goal?: string;
  difficulty_level?: string;
  notifications?: {
    daily_reminders: boolean;
    achievements: boolean;
    product_updates: boolean;
  };
}

// ========== INTERFACES LEGACY (mantener compatibilidad) ==========

export interface TrialStatus {
  trial_end: string;
  trial_active: boolean;
  is_subscribed: boolean;
  onboarding_seen: boolean;
}

export interface UserInfo {
  id: string;
  email: string;
  subscription_type: string;
  plan_type: string;
  is_subscribed: boolean;
  trial_active: boolean;
  trial_end: string | null;
  onboarding_seen: boolean;
  created_at: string;
}

export interface PlanInfo {
  current_plan: string;
  is_premium: boolean;
  features: {
    name: string;
    max_suggestions: number;
    features: string[];
    analyzer_type: string;
  };
}

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

  startTrial(): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/start-trial`,
      {}
    );
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
