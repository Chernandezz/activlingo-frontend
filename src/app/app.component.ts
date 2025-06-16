import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(public router: Router) {}

  ngOnInit() {
    // Fix para NavigatorLockManager en algunos navegadores
    if (typeof navigator !== 'undefined' && !navigator.locks) {
      (navigator as any).locks = {
        request: () => Promise.resolve(),
      };
    }
  }

  isAuthPage(): boolean {
    return this.router.url.startsWith('/auth');
  }
}
