// src/app/core/services/subscription.service.ts - COMPLETAMENTE NUEVO Y LIMPIO
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  CheckoutResponse,
  TrialResponse,
  CancelResponse,
} from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/subscription`;

  constructor(private http: HttpClient) {}

  // ========== PLANES ==========

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http
      .get<SubscriptionPlan[]>(`${this.apiUrl}/plans`)
      .pipe(catchError(this.handleError));
  }

  // ========== ESTADO DE SUSCRIPCIÓN ==========

  getStatus(): Observable<SubscriptionStatus> {
    return this.http
      .get<SubscriptionStatus>(`${this.apiUrl}/status`)
      .pipe(catchError(this.handleError));
  }

  // ========== CHECKOUT ==========

  createCheckout(
    planSlug: string,
    billingInterval: 'monthly' | 'yearly' = 'monthly'
  ): Observable<CheckoutResponse> {
    const payload = {
      plan_slug: planSlug,
      billing_interval: billingInterval,
    };

    return this.http
      .post<CheckoutResponse>(`${this.apiUrl}/checkout`, payload)
      .pipe(catchError(this.handleError));
  }

  // ========== TRIAL ==========

  startTrial(): Observable<TrialResponse> {
    return this.http
      .post<TrialResponse>(`${this.apiUrl}/trial/start`, { accept_terms: true })
      .pipe(catchError(this.handleError));
  }

  // ========== GESTIÓN ==========

  cancel(): Observable<CancelResponse> {
    return this.http
      .post<CancelResponse>(`${this.apiUrl}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  // ========== UTILIDADES ==========

  canUpgradeTo(currentPlanSlug: string, targetPlanSlug: string): boolean {
    const hierarchy = ['basic', 'premium', 'premium_yearly'];
    const currentIndex = hierarchy.indexOf(currentPlanSlug);
    const targetIndex = hierarchy.indexOf(targetPlanSlug);
    return targetIndex > currentIndex;
  }

  isActive(status: string): boolean {
    return ['active', 'trial'].includes(status);
  }

  isCanceled(status: string): boolean {
    return status === 'canceled';
  }

  isPremium(planSlug: string): boolean {
    return planSlug !== 'basic';
  }

  getStatusText(status: string): string {
    const statusTexts: Record<string, string> = {
      active: 'Activa',
      canceled: 'Cancelada',
      expired: 'Expirada',
      trial: 'Prueba gratuita',
      past_due: 'Pago pendiente',
      no_subscription: 'Sin suscripción',
    };
    return statusTexts[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      active: 'text-green-600',
      canceled: 'text-yellow-600',
      expired: 'text-red-600',
      trial: 'text-blue-600',
      past_due: 'text-orange-600',
      no_subscription: 'text-gray-600',
    };
    return statusColors[status] || 'text-gray-600';
  }

  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(price);
  }

  getBillingIntervalText(interval: string): string {
    const texts: Record<string, string> = {
      monthly: 'mes',
      yearly: 'año',
      trial: 'prueba',
    };
    return texts[interval] || interval;
  }

  getPlanBadgeColor(planSlug: string): string {
    const colors: Record<string, string> = {
      basic: 'bg-gray-100 text-gray-700',
      premium: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white',
      premium_yearly:
        'bg-gradient-to-r from-purple-400 to-purple-600 text-white',
      trial: 'bg-gradient-to-r from-green-400 to-green-600 text-white',
    };
    return colors[planSlug] || colors['basic'];
  }

  calculateTrialDaysRemaining(endDate: string): number {
    if (!endDate) return 0;

    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  }

  // ========== MANEJO DE ERRORES ==========

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('❌ SubscriptionService Error:', error);

    let errorMessage = 'Ha ocurrido un error inesperado';

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

    return throwError(() => new Error(errorMessage));
  }
}
