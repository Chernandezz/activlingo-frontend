// src/app/features/onboarding/pages/onboarding-welcome-overlay.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, TrialStatus } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding-welcome-overlay',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './onboarding-welcome-overlay.component.html',
  styleUrls: ['./onboarding-welcome-overlay.component.css'],
})
export class OnboardingWelcomeOverlayComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  /** Este campo se mostrará en la plantilla con el pipe date */
  trialEndDate: string = '';

  /** Mientras haga la petición, estará true. Luego pasará a false. */
  loading = true;

  ngOnInit(): void {
    // Llamamos 1 sola vez a getTrialInfo()
    this.userService.getTrialInfo().subscribe({
      next: (res: TrialStatus) => {
        // Si la trial está activa y no está suscrito, mostramos la fecha
        if (res.trial_active && !res.is_subscribed) {
          this.trialEndDate = new Date(res.trial_end).toLocaleDateString();
        }
        // En cualquier caso, ya no estamos cargando
        this.loading = false;
      },
      error: () => {
        // Si hay error (token inválido, JWT expirado, etc.), cerramos directamente
        this.loading = false;
        this.handleClose();
      },
    });
  }

  /** El usuario hace clic en “¡Empezar ahora!” o cierra con la equis */
  handleClose() {
    // Se marca en localStorage para no volver a mostrar este overlay
    localStorage.setItem('onboarding_seen', 'true');
    // Redirigimos (o simplemente ocultamos el modal; depende cómo lo incluyas)
    this.router.navigate(['/chats']);
  }

  /** El usuario prefiere ir a la página de precios / suscripción */
  goToPricing() {
    localStorage.setItem('onboarding_seen', 'true');
    this.router.navigate(['/pricing']);
  }

  /** (Opcional) Si quisieras iniciar la trial explícitamente   */
  startFreeTrial() {
    localStorage.setItem('onboarding_seen', 'true');
    // Como el trial ya arrancó cuando se creó el usuario, no necesitas otra llamada al backend
  }
}
