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

  trialEndDate: string = '';
  loading = true;

  ngOnInit(): void {
    this.userService.getTrialInfo().subscribe({
      next: (res: TrialStatus) => {
        if (res.trial_active && !res.is_subscribed) {
          this.trialEndDate = new Date(res.trial_end).toLocaleDateString();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.startFreeTrial.emit(); // Emitimos para cerrar el overlay aunque falle
      },
    });
  }

  /** El usuario hace clic en “Iniciar mi prueba” */
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

  goToPricing(): void {
    this.http
      .post<{ url: string }>(
        `${environment.apiUrl}/stripe/create-checkout-session`,
        {}
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
}
