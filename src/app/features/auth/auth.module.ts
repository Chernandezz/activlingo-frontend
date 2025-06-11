// features/auth/auth.module.ts
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '', component: AuthPageComponent }]),
  ],
  declarations: [],
  providers: [],
})
export class AuthModule {}
