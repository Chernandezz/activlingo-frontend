import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full',
  },

  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/pages/chat-page/chat-page.component').then(
        (c) => c.ChatPageComponent
      ),
  },
  {
    path: 'dictionary',
    loadComponent: () =>
      import(
        './features/dictionary/pages/dictionary-page/dictionary-page.component'
      ).then((c) => c.DictionaryPageComponent),
  },
];
