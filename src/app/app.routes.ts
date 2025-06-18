// src/app/app.routes.ts - VERSIÓN FINAL CORREGIDA
import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  // ========== RUTAS DE AUTENTICACIÓN ==========
  {
    path: 'auth',
    canActivate: [NoAuthGuard], // 🔧 CAMBIO: Usar NoAuthGuard en lugar de GuestGuard
    loadComponent: () =>
      import('./features/auth/pages/auth-page/auth-page.component').then(
        (c) => c.AuthPageComponent
      ),
  },
  {
    path: 'auth/callback',
    // Sin guard - debe ser libre para OAuth callbacks
    loadComponent: () =>
      import(
        './features/auth/pages/auth-callback/auth-callback.component'
      ).then((c) => c.AuthCallbackComponent),
  },

  // ========== RUTAS PRINCIPALES PROTEGIDAS ==========
  {
    path: 'chat',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/chat/pages/chat-page/chat-page.component').then(
        (c) => c.ChatPageComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/components/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'dictionary',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './features/dictionary/pages/dictionary-page/dictionary-page.component'
      ).then((c) => c.DictionaryPageComponent),
  },

  // ========== RUTAS DE PAGO (SIN GUARDS) ==========
  {
    path: 'success',
    // ✅ Sin guard - accesible después del pago
    loadComponent: () =>
      import(
        './features/onboarding/pages/success-page/success-page.component'
      ).then((m) => m.SuccessPageComponent),
  },
  {
    path: 'cancel',
    // ✅ Sin guard - accesible si cancela el pago
    loadComponent: () =>
      import(
        './features/onboarding/pages/cancel-page/cancel-page.component'
      ).then((m) => m.CancelPageComponent),
  },

  // ========== RUTAS DE REDIRECCIÓN ==========
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'chat',
  },
];
