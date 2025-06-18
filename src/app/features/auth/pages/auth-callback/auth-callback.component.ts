// features/auth/pages/auth-callback/auth-callback.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { supabase } from '../../../../core/utils/supabase-client';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="inline-block p-3 bg-white rounded-2xl shadow-lg mb-4">
          <div
            class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"
          >
            <div
              class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
          </div>
        </div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">
          Completando autenticación...
        </h2>
        <p class="text-gray-600">Por favor espera un momento.</p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit(): Promise<void> {

    try {
      // Esperar un momento para que Supabase procese el callback
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verificar la sesión
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('❌ Error in auth callback:', error);
        this.router.navigate(['/auth']);
        return;
      }

      if (session?.user) {

        // Asegurar que el AuthService tiene al usuario
        this.authService.setUser(session.user);

        // Navegar al chat
        this.router.navigate(['/chat']);
      } else {
        this.router.navigate(['/auth']);
      }
    } catch (error) {
      this.router.navigate(['/auth']);
    }
  }
}
