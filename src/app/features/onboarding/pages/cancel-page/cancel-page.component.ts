// src/app/features/onboarding/pages/cancel-page/cancel-page.component.ts - MEJORADO
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cancel-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4"
    >
      <div
        class="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center relative overflow-hidden"
        >
          <!-- Elementos decorativos -->
          <div
            class="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full"
          ></div>
          <div
            class="absolute bottom-4 right-4 w-12 h-12 bg-white/10 rounded-full"
          ></div>

          <div class="relative z-10">
            <div
              class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <i class="fas fa-times text-3xl"></i>
            </div>
            <h1 class="text-3xl font-bold mb-2">Pago Cancelado</h1>
            <p class="text-orange-100">No se realizó ningún cargo</p>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              No te preocupes 😊
            </h2>
            <p class="text-gray-600 leading-relaxed mb-6">
              Cancelaste el proceso de pago. Tu cuenta sigue activa y puedes
              continuar usando ActivLingo con las funciones gratuitas.
            </p>

            <!-- Recordatorio de funciones gratuitas -->
            <div class="bg-blue-50 rounded-xl p-6 mb-6">
              <h3 class="font-semibold text-blue-900 mb-3">
                🆓 Tu acceso gratuito incluye:
              </h3>
              <div class="space-y-2 text-sm text-blue-800">
                <div class="flex items-center gap-2">
                  <i class="fas fa-check text-blue-600"></i>
                  <span>5 conversaciones por día</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-check text-blue-600"></i>
                  <span>Análisis básico de gramática</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-check text-blue-600"></i>
                  <span>Diccionario personal básico</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-3">
            <button
              (click)="goToChat()"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <i class="fas fa-comments"></i>
              <span>Continuar Practicando</span>
            </button>

            <button
              (click)="tryAgain()"
              class="w-full border-2 border-orange-300 text-orange-700 py-3 px-6 rounded-xl font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
            >
              <i class="fas fa-crown"></i>
              <span>Ver Planes Premium</span>
            </button>

            <button
              (click)="goToProfile()"
              class="w-full text-gray-600 py-2 px-6 rounded-xl font-medium hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <i class="fas fa-user"></i>
              <span>Mi Perfil</span>
            </button>
          </div>

          <!-- Ayuda -->
          <div class="mt-8 text-center border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-500 mb-2">¿Necesitas ayuda?</p>
            <p class="text-sm text-gray-600">
              Contacta nuestro soporte en
              <a
                href="mailto:support@activlingo.com"
                class="text-blue-600 hover:text-blue-800 underline"
              >
                support&#64;activlingo.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CancelPageComponent {
  constructor(private router: Router) {}

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  tryAgain(): void {
    this.router.navigate(['/profile'], { fragment: 'settings' });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
