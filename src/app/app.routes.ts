import { Routes } from '@angular/router';
import { AuthGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },

  {
    path: 'chat',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/chat/pages/chat-page/chat-page.component').then(
        (c) => c.ChatPageComponent
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
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/pages/auth-page/auth-page.component').then(
        (c) => c.AuthPageComponent
      ),
  },
];
