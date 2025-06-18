// src/app/features/auth/guards/auth.guard.ts - VERSIÓN FINAL
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { map, take, catchError, filter, switchMap } from 'rxjs/operators';
import { Observable, of, combineLatest } from 'rxjs';

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

    // 🔧 SOLUCIÓN: Esperar a que la auth esté resuelta antes de verificar
    return this.authService.isAuthResolved$.pipe(
      filter((resolved) => {
        return resolved; // Solo continuar cuando esté resuelto
      }),
      take(1), // Tomar solo el primer valor cuando esté resuelto
      switchMap(() => {
        // Ahora que sabemos que la auth está resuelta, verificar el usuario
        return this.authService.user$.pipe(take(1));
      }),
      map((user) => {
        const isLoggedIn = this.authService.isLoggedIn();


        if (isLoggedIn && user) {
          return true;
        } else {
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

// 🆕 GUARD ADICIONAL para páginas que NO requieren autenticación (como /auth)
@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {

    return this.authService.isAuthResolved$.pipe(
      filter((resolved) => {
        return resolved;
      }),
      take(1),
      switchMap(() => {
        return this.authService.user$.pipe(take(1));
      }),
      map((user) => {
        const isLoggedIn = this.authService.isLoggedIn();


        if (isLoggedIn && user) {

          this.router.navigate(['/chat']);
          return false;
        } else {
          return true;
        }
      }),
      catchError((error) => {
        return of(true);
      })
    );
  }
}
