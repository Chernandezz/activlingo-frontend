// src/app/features/onboarding/pages/onboarding-welcome-overlay.component.ts

import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, TrialStatus } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-onboarding-welcome-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-welcome-overlay.component.html',
  styleUrls: ['./onboarding-welcome-overlay.component.css'],
})
export class OnboardingWelcomeOverlayComponent implements OnInit {
  private userService = inject(UserService);
  private http = inject(HttpClient);

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
    this.userService.markOnboardingSeen().subscribe({
      next: () => {
        this.startFreeTrial.emit();
      },
      error: (err) => {
        console.error('Error al marcar onboarding visto:', err);
        this.startFreeTrial.emit();
      },
    });
  }

  /** Seleccionar un plan específico */
  selectPlan(planType: 'basic' | 'premium'): void {
    console.log(`🎯 Plan seleccionado: ${planType}`);

    // Crear checkout session con el plan seleccionado
    this.http
      .post<{ url: string }>(
        `${environment.apiUrl}/stripe/create-checkout-session`,
        {
          plan_type: planType,
          price_id:
            planType === 'basic'
              ? 'price_basic_monthly' // ID del precio en Stripe para plan básico
              : 'price_premium_monthly', // ID del precio en Stripe para plan premium
        }
      )
      .subscribe({
        next: (res) => {
          if (res.url) {
            window.location.href = res.url;
          }
        },
        error: (err) => {
          console.error('Error iniciando pago con Stripe:', err);
          alert(
            'Hubo un problema al iniciar el proceso de pago. Intenta de nuevo.'
          );
        },
      });
  }

  /** Legacy method para compatibilidad */
  goToPricing(): void {
    this.selectPlan('premium'); // Default a premium
  }
}
