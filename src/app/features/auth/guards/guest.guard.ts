// src/app/features/auth/guards/guest.guard.ts - MEJORADO
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';

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


        // ✅ Si el usuario está logueado, redirigir a chat
        if (isLoggedIn && user) {
          this.router.navigate(['/chat']);
          return false;
        }

        return true;
      }),
      catchError((error) => {
        // ✅ En caso de error, permitir acceso (presumir no autenticado)
        console.warn('⚠️ GuestGuard error, permitiendo acceso:', error);
        return [true];
      })
    );
  }
}
