// features/auth/guards/guest.guard.ts - VERSIÓN INTELIGENTE
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        const isLoggedIn = this.authService.isLoggedIn();
        const currentPath = route.routeConfig?.path;

        console.log('🚪 GuestGuard check:', {
          user: !!user,
          isLoggedIn,
          currentPath,
          userEmail: user?.email,
        });

        // 🔧 PERMITIR /auth si es callback o si viene de Google OAuth
        if (currentPath === 'auth') {
          // Si está logueado, redirigir a chat
          if (isLoggedIn && user) {
            console.log('✅ User is logged in, redirecting to chat');
            this.router.navigate(['/chat']);
            return false;
          }
          // Si no está logueado, permitir acceso a auth
          return true;
        }

        // Para otras rutas "guest", funcionar normal
        if (isLoggedIn && user) {
          this.router.navigate(['/chat']);
          return false;
        }

        return true;
      })
    );
  }
}
