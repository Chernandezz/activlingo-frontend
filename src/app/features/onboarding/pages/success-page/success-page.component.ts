// src/app/features/onboarding/pages/success-page/success-page.component.ts - MEJORADO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4"
    >
      <div
        class="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <!-- Header con animación -->
        <div
          class="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center relative overflow-hidden"
        >
          <!-- Elementos decorativos -->
          <div
            class="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"
          ></div>
          <div
            class="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full animate-pulse"
            style="animation-delay: 0.5s;"
          ></div>

          <div class="relative z-10">
            <div
              class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
            >
              <i class="fas fa-check text-3xl"></i>
            </div>
            <h1 class="text-3xl font-bold mb-2">¡Suscripción Activada!</h1>
            <p class="text-green-100">Tu acceso premium está listo</p>
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-xl font-semibold text-gray-900 mb-3">
              🎉 ¡Bienvenido a ActivLingo Premium!
            </h2>
            <p class="text-gray-600 leading-relaxed">
              Ahora tienes acceso completo a todas las funciones avanzadas:
            </p>
          </div>

          <!-- Features desbloqueadas -->
          <div class="grid grid-cols-1 gap-3 mb-8">
            <div
              class="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <div
                class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
              >
                <i class="fas fa-infinity text-white text-sm"></i>
              </div>
              <span class="text-green-800 font-medium"
                >Conversaciones ilimitadas</span
              >
            </div>

            <div
              class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div
                class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <i class="fas fa-chart-line text-white text-sm"></i>
              </div>
              <span class="text-blue-800 font-medium"
                >Análisis detallado avanzado</span
              >
            </div>

            <div
              class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
            >
              <div
                class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center"
              >
                <i class="fas fa-book text-white text-sm"></i>
              </div>
              <span class="text-purple-800 font-medium"
                >Diccionario personal ilimitado</span
              >
            </div>

            <div
              class="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
            >
              <div
                class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <i class="fas fa-headset text-white text-sm"></i>
              </div>
              <span class="text-orange-800 font-medium"
                >Soporte prioritario</span
              >
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="space-y-3">
            <button
              (click)="goToChat()"
              class="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <i class="fas fa-comments"></i>
              <span>¡Empezar a Practicar!</span>
            </button>

            <button
              (click)="goToProfile()"
              class="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <i class="fas fa-user"></i>
              <span>Ver Mi Perfil</span>
            </button>
          </div>

          <!-- Info adicional -->
          <div class="mt-6 text-center">
            <p class="text-sm text-gray-500">
              Recibiste un email de confirmación con los detalles de tu
              suscripción
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SuccessPageComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Refrescar datos del usuario después del pago exitoso
    this.userService.getFullProfile().subscribe({
      next: (profile) => {
        console.log('✅ User profile refreshed after successful payment');
      },
      error: (error) => {
        console.warn('Could not refresh user profile:', error);
      },
    });

    // Opcional: Mostrar mensaje de éxito temporal
    const sessionId = this.route.snapshot.queryParams['session_id'];
    if (sessionId) {
      console.log('💳 Payment session ID:', sessionId);
    }
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
