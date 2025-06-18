// src/app/features/auth/guards/auth.guard.ts - MEJORADO
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { map, take, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        const isLoggedIn = this.authService.isLoggedIn();

        console.log('🔐 AuthGuard check:', {
          user: !!user,
          isLoggedIn,
          userEmail: user?.email,
          timestamp: new Date().toISOString(),
        });

        if (isLoggedIn && user) {
          // ✅ Usuario autenticado - permitir acceso
          return true;
        } else {
          // ❌ No autenticado - redirigir a login
          console.log(
            '🔒 AuthGuard: Usuario no autenticado, redirigiendo a /auth'
          );
          this.router.navigate(['/auth']);
          return false;
        }
      }),
      catchError((error) => {
        // ❌ Error en verificación - redirigir a login por seguridad
        console.error('❌ AuthGuard error:', error);
        this.router.navigate(['/auth']);
        return of(false);
      })
    );
  }
}
