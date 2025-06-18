import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  isResolved = false;
  private subscription = new Subscription();

  constructor(public router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Fix para navegadores sin locks API
    if (typeof navigator !== 'undefined' && !navigator.locks) {
      (navigator as any).locks = {
        request: () => Promise.resolve(),
      };
    }

    // 🔧 SUSCRIBIRSE A LA RESOLUCIÓN DE AUTH
    this.subscription.add(
      this.authService.isAuthResolved$.subscribe((resolved) => {
        this.isResolved = resolved;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // 🔧 MÉTODO PARA VERIFICAR SI ESTAMOS EN PÁGINA DE AUTH
  isAuthPage(): boolean {
    const url = this.router.url;
    const isAuth = url.startsWith('/auth');
    return isAuth;
  }
}
