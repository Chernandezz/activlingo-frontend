// src/app/features/onboarding/pages/onboarding-welcome-overlay.component.ts - COMPLETAMENTE ACTUALIZADO
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { UserService } from '../../../core/services/user.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../../../core/models/subscription.model';

@Component({
  selector: 'app-onboarding-welcome-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-welcome-overlay.component.html',
  styleUrls: ['./onboarding-welcome-overlay.component.css'],
})
export class OnboardingWelcomeOverlayComponent implements OnInit {
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService);
  private router = inject(Router);

  @Output() startFreeTrial = new EventEmitter<void>();

  // ========== ESTADO ==========
  loading = true;
  processingTrial = false;
  processingPayment = false;
  selectedPlan: string | null = null;

  // ========== DATOS ==========
  trialEndDate: Date = new Date();
  availablePlans: SubscriptionPlan[] = [];
  subscriptionStatus: SubscriptionStatus | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ========== CARGA DE DATOS ==========

  private loadInitialData(): void {
    this.loading = true;

    // Calcular fecha de fin de prueba (3 días desde hoy)
    const today = new Date();
    this.trialEndDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Cargar estado de suscripción y planes
    this.subscriptionService.getStatus().subscribe({
      next: (status) => {
        console.log('✅ Estado de suscripción:', status);
        this.subscriptionStatus = status;

        // Si ya está en trial, actualizar fecha de fin
        if (status.status === 'trial' && status.subscription?.ends_at) {
          this.trialEndDate = new Date(status.subscription.ends_at);
        }

        this.loadPlans();
      },
      error: (error) => {
        console.error('❌ Error cargando estado:', error);
        this.loadPlans(); // Continuar cargando planes aunque falle el estado
      },
    });
  }

  private loadPlans(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        console.log('✅ Planes disponibles:', plans);
        // Filtrar solo planes pagos para mostrar en onboarding
        this.availablePlans = plans.filter((plan) => plan.slug !== 'basic');
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando planes:', error);
        this.loading = false;
      },
    });
  }

  // ========== ACCIONES DE TRIAL ==========

  confirmStartTrial(): void {
    if (this.processingTrial) return;

    console.log('🔄 Iniciando prueba gratuita...');
    this.processingTrial = true;

    this.subscriptionService
      .startTrial()
      .pipe(finalize(() => (this.processingTrial = false)))
      .subscribe({
        next: (response) => {
          console.log('✅ Trial iniciado:', response);
          this.markOnboardingCompleted();
        },
        error: (error) => {
          console.error('❌ Error iniciando trial:', error);
          this.showError('Error al iniciar la prueba gratuita');
        },
      });
  }

  private markOnboardingCompleted(): void {
    this.userService.markOnboardingCompleted().subscribe({
      next: () => {
        console.log('✅ Onboarding marcado como completado');
        this.startFreeTrial.emit();
      },
      error: (error) => {
        console.error('❌ Error marcando onboarding:', error);
        // Emitir evento aunque falle el marcado
        this.startFreeTrial.emit();
      },
    });
  }

  // ========== ACCIONES DE SUSCRIPCIÓN ==========

  selectPlan(planSlug: string): void {
    if (this.processingPayment) return;

    console.log(`🔄 Seleccionando plan: ${planSlug}`);

    this.processingPayment = true;
    this.selectedPlan = planSlug;

    this.subscriptionService
      .createCheckout(planSlug, 'monthly')
      .pipe(
        finalize(() => {
          this.processingPayment = false;
          this.selectedPlan = null;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Checkout creado:', response);

          if (response?.checkout_url) {
            console.log('🔄 Redirigiendo a Stripe...');
            window.location.href = response.checkout_url;
          } else {
            console.error('❌ No se recibió checkout_url:', response);
            this.showError('No se pudo generar la URL de pago');
          }
        },
        error: (error) => {
          console.error('❌ Error en checkout:', error);
          this.showError(error.message || 'Error al procesar el pago');
        },
      });
  }

  // ========== UTILIDADES DE UI ==========

  get isTrialActive(): boolean {
    return this.subscriptionStatus?.status === 'trial';
  }

  get isSubscribed(): boolean {
    return this.subscriptionService.isActive(
      this.subscriptionStatus?.status || ''
    );
  }

  get trialDaysRemaining(): number {
    if (!this.subscriptionStatus?.subscription?.ends_at) return 3;
    return this.subscriptionService.calculateTrialDaysRemaining(
      this.subscriptionStatus.subscription.ends_at
    );
  }

  get premiumPlan(): SubscriptionPlan | undefined {
    return this.availablePlans.find((plan) => plan.slug === 'premium');
  }

  get premiumYearlyPlan(): SubscriptionPlan | undefined {
    return this.availablePlans.find((plan) => plan.slug === 'premium_yearly');
  }

  formatPrice(price: number): string {
    return this.subscriptionService.formatPrice(price);
  }

  getBillingIntervalText(interval: string): string {
    return this.subscriptionService.getBillingIntervalText(interval);
  }

  getPlanBadgeColor(planSlug: string): string {
    return this.subscriptionService.getPlanBadgeColor(planSlug);
  }

  isProcessingPlan(planSlug: string): boolean {
    return this.processingPayment && this.selectedPlan === planSlug;
  }

  formatTrialEndDate(): string {
    return this.trialEndDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
    });
  }



  // ========== UTILIDADES ==========

  private showError(message: string): void {
    // En una implementación real, podrías usar un servicio de notificaciones
    alert(message);
  }

  private showSuccess(message: string): void {
    // En una implementación real, podrías usar un servicio de notificaciones
    console.log('✅ Success:', message);
  }
}
