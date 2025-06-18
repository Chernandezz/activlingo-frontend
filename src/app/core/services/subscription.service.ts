// src/app/core/services/subscription.service.ts - CORREGIDO
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CancelResponse,
  CheckoutResponse,
  SubscriptionPlan,
  UserSubscription,
} from '../models/subscription.model';
import { PlanFeaturesConfig } from '../interfaces/plan-feature.interface';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) {}

  // ========== PLANES ==========
  getAvailablePlans(): Observable<{ plans: SubscriptionPlan[] }> {
    return this.http
      .get<{ plans: SubscriptionPlan[] }>(`${this.apiUrl}/plans`)
      .pipe(catchError(this.handleError));
  }

  // ========== SUSCRIPCIÓN ACTUAL ==========
  getCurrentSubscription(): Observable<UserSubscription> {
    return this.http
      .get<UserSubscription>(`${this.apiUrl}/current`)
      .pipe(catchError(this.handleError));
  }

  // ========== UPGRADE (ENDPOINT CORREGIDO) ==========
  createUpgradeSession(
    planSlug: string,
    billingInterval: 'monthly' | 'yearly' = 'monthly'
  ): Observable<CheckoutResponse> {
    console.log(`🔄 Creando sesión de upgrade para plan: ${planSlug}`);

    const payload = {
      plan_slug: planSlug,
      billing_interval: billingInterval,
    };

    console.log('📦 Payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/upgrade`, payload).pipe(
      map((response) => {
        console.log('✅ Respuesta del servidor:', response);

        if (response.success && response.checkout_url) {
          return {
            success: true,
            checkout_url: response.checkout_url,
            session_id: response.session_id,
          } as CheckoutResponse;
        } else {
          throw new Error(
            response.detail || 'No se pudo crear la sesión de pago'
          );
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error en createUpgradeSession:', error);

        let errorMessage = 'Error al procesar el pago. Intenta de nuevo.';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        console.error('📋 Error procesado:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // ========== CANCELACIÓN ==========
  cancelSubscription(): Observable<CancelResponse> {
    return this.http
      .post<CancelResponse>(`${this.apiUrl}/cancel`, {})
      .pipe(catchError(this.handleError));
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
    return this.http
      .get<{
        plan_slug: string;
        has_premium: boolean;
        max_conversations_per_day: number;
        max_words_per_day: number;
        priority_support: boolean;
        status: string;
      }>(`${this.apiUrl}/access`)
      .pipe(catchError(this.handleError));
  }

  // ========== TRIAL ==========
  startTrial(): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<{ success: boolean; message: string }>(
        `${this.apiUrl}/trial/start`,
        { accept_terms: true }
      )
      .pipe(catchError(this.handleError));
  }

  // ========== DEBUG ==========
  debugUserSubscription(): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/debug/user/me`)
      .pipe(catchError(this.handleError));
  }

  // ========== MANEJO DE ERRORES ==========
  private handleError(error: HttpErrorResponse) {
    console.error('❌ Error en SubscriptionService:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.detail) {
          errorMessage = error.error.detail;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        }
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // ========== UTILIDADES ==========
  canAccessFeature(planSlug: string, feature: string): boolean {
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
