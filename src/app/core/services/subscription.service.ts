// src/app/core/services/subscription.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CancelResponse, CheckoutResponse, SubscriptionPlan, UserSubscription } from '../models/subscription.model';
import { PlanFeaturesConfig } from '../interfaces/plan-feature.interface';


@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) {}

  // ========== PLANES ==========
  getAvailablePlans(): Observable<{ plans: SubscriptionPlan[] }> {
    return this.http.get<{ plans: SubscriptionPlan[] }>(`${this.apiUrl}/plans`);
  }

  // ========== SUSCRIPCIÓN ACTUAL ==========
  getCurrentSubscription(): Observable<UserSubscription> {
    return this.http.get<UserSubscription>(`${this.apiUrl}/current`);
  }

  // ========== UPGRADE ==========
  createUpgradeSession(
    planSlug: string,
    billingInterval: 'monthly' | 'yearly' = 'monthly'
  ): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/upgrade`, {
      plan_slug: planSlug,
      billing_interval: billingInterval,
    });
  }

  // ========== CANCELACIÓN ==========
  cancelSubscription(): Observable<CancelResponse> {
    return this.http.post<CancelResponse>(`${this.apiUrl}/cancel`, {});
  }

  // ========== ACCESO ==========
  getPlanAccess(): Observable<{
    plan_slug: string;
    has_premium: boolean;
    max_conversations_per_day: number;
    max_words_per_day: number;
    priority_support: boolean;
    status: string;
  }> {
    return this.http.get<{
      plan_slug: string;
      has_premium: boolean;
      max_conversations_per_day: number;
      max_words_per_day: number;
      priority_support: boolean;
      status: string;
    }>(`${this.apiUrl}/access`);
  }

  // ========== UTILIDADES ==========
  canAccessFeature(planSlug: string, feature: string): boolean {
    // ✅ CONFIGURACIÓN CON TIPADO CORRECTO
    const features: PlanFeaturesConfig = {
      basic: {
        unlimited_conversations: false,
        advanced_scenarios: false,
        priority_support: false,
        analytics: false,
        export_data: false,
        max_conversations_per_day: 5,
      },
      premium: {
        unlimited_conversations: true,
        advanced_scenarios: true,
        priority_support: true,
        analytics: true,
        export_data: true,
        max_conversations_per_day: -1,
      },
      premium_yearly: {
        unlimited_conversations: true,
        advanced_scenarios: true,
        priority_support: true,
        analytics: true,
        export_data: true,
        api_access: true,
        custom_scenarios: true,
        max_conversations_per_day: -1,
      },
    };

    const planFeatures = features[planSlug] || features['basic'];
    return planFeatures[feature] === true;
  }

  isPremiumPlan(planSlug: string): boolean {
    return planSlug !== 'basic';
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  getBillingIntervalText(interval: string): string {
    const texts: { [key: string]: string } = {
      monthly: 'mes',
      yearly: 'año',
    };
    return texts[interval] || interval;
  }

  getPlanHierarchy(): string[] {
    return ['basic', 'premium', 'premium_yearly'];
  }

  canUpgradeTo(currentPlanSlug: string, targetPlanSlug: string): boolean {
    const hierarchy = this.getPlanHierarchy();
    const currentIndex = hierarchy.indexOf(currentPlanSlug);
    const targetIndex = hierarchy.indexOf(targetPlanSlug);

    return targetIndex > currentIndex;
  }

  
    startTrial(): Observable<{ success: boolean; message: string }> {
      return this.http.post<{ success: boolean; message: string }>(
        `${this.apiUrl}/trial/start`,
        {}
      );
    }

  isSubscriptionActive(status: string): boolean {
    return ['active', 'trial'].includes(status);
  }

  isSubscriptionCanceled(status: string): boolean {
    return status === 'canceled';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      active: 'Activa',
      canceled: 'Cancelada',
      expired: 'Expirada',
      trial: 'Prueba gratuita',
      past_due: 'Pago pendiente',
    };
    return statusTexts[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      active: 'text-green-600',
      canceled: 'text-yellow-600',
      expired: 'text-red-600',
      trial: 'text-blue-600',
      past_due: 'text-orange-600',
    };
    return statusColors[status] || 'text-gray-600';
  }
}
