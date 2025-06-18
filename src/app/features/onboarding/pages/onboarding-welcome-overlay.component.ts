// src/app/features/onboarding/pages/onboarding-welcome-overlay.component.ts - CORREGIDO
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { SubscriptionService } from '../../../core/services/subscription.service'; // ✅ AGREGADO
import { CommonModule } from '@angular/common';
import { TrialStatus } from '../../../core/models/user-legacy.model';

@Component({
  selector: 'app-onboarding-welcome-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-welcome-overlay.component.html',
  styleUrls: ['./onboarding-welcome-overlay.component.css'],
})
export class OnboardingWelcomeOverlayComponent implements OnInit {
  private userService = inject(UserService);
  private subscriptionService = inject(SubscriptionService); // ✅ CORREGIDO: inject() en lugar de declaración

  @Output() startFreeTrial = new EventEmitter<void>();

  trialEndDate: Date = new Date();
  loading = true;

  ngOnInit(): void {
    // Calcular fecha de fin de prueba (3 días desde hoy)
    const today = new Date();
    this.trialEndDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    this.userService.getTrialInfo().subscribe({
      next: (res: TrialStatus) => {
        if (res.trial_active && !res.is_subscribed) {
          this.trialEndDate = new Date(res.trial_end);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  /** El usuario hace clic en "Iniciar mi prueba gratuita" */
  confirmStartTrial(): void {
    this.subscriptionService.startTrial().subscribe({
      next: () => {
        this.userService.markOnboardingSeen().subscribe({
          next: () => {
            this.startFreeTrial.emit();
          },
          error: (err) => {
            console.error('Error al marcar onboarding visto:', err);
            this.startFreeTrial.emit();
          },
        });
      },
      error: (err) => {
        console.error('Error iniciando trial:', err);
        this.startFreeTrial.emit(); 
      },
    });
  }

  /** Seleccionar un plan específico */
  selectPlan(planType: 'basic' | 'premium'): void {

    // ✅ CORREGIDO: Usar el servicio correctamente inyectado
    this.subscriptionService
      .createUpgradeSession(planType, 'monthly')
      .subscribe({
        next: (response) => {
          if (response?.checkout_url) {
            window.location.href = response.checkout_url;
          }
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error al procesar el pago. Intenta de nuevo.');
        },
      });
  }

  /** Legacy method para compatibilidad */
  goToPricing(): void {
    this.selectPlan('premium'); // Default a premium
  }
}
