// core/guards/auth.guard.ts - GUARD CORREGIDO
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean {
    // Verificar estado de autenticación
    return this.authService.user$.pipe(
      take(1),
      map((user) => {
        const isLoggedIn = this.authService.isLoggedIn();

        console.log('AuthGuard check:', {
          user,
          isLoggedIn,
          authState: this.authService.getAuthState(),
        });

        if (isLoggedIn && user) {
          return true;
        } else {
          console.log('AuthGuard: redirecting to login');
          this.router.navigate(['/auth']);
          return false;
        }
      })
    );
  }
}
