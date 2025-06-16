// src/app/core/services/user.service.ts - ACTUALIZADO

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface TrialStatus {
  trial_end: string;
  trial_active: boolean;
  is_subscribed: boolean;
  onboarding_seen: boolean;
}

// 🆕 Interface para información del usuario completa
export interface UserInfo {
  id: string;
  email: string;
  subscription_type: string; // 'basic' | 'premium'
  plan_type: string;
  is_subscribed: boolean;
  trial_active: boolean;
  trial_end: string | null;
  onboarding_seen: boolean;
  created_at: string;
}

// 🆕 Interface para información del plan
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

  // Métodos existentes
  getTrialInfo(): Observable<TrialStatus> {
    return this.http.get<TrialStatus>(`${this.apiUrl}/trial-status`);
  }

  markOnboardingSeen(): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding-seen`, {});
  }

  // 🆕 Obtener información completa del usuario
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.apiUrl}/profile`);
  }

  // 🆕 Obtener información del plan actual
  getPlanInfo(): Observable<PlanInfo> {
    return this.http.get<PlanInfo>(`${this.apiUrl}/plan-info`);
  }

  // 🆕 Actualizar plan del usuario (para cuando se suscriban)
  updateSubscriptionPlan(planType: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-plan`, {
      subscription_type: planType,
    });
  }

  // 🆕 Verificar si el usuario tiene acceso premium
  hasPremiumAccess(): Observable<{ has_premium: boolean; plan_type: string }> {
    return this.http.get<{ has_premium: boolean; plan_type: string }>(
      `${this.apiUrl}/premium-access`
    );
  }
}
