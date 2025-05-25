// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { ApiService } from './data/api/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { MockLanguageAnalysisService } from './features/analysis/services/mock-language-analysis.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    ApiService,
    FontAwesomeModule,
    // MockLanguageAnalysisService,
  ],
};
