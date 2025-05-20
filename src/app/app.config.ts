// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { LocalChatRepository } from './data/repositories/local-chat.repository';
import { ApiService } from './data/api/api.service';
import { LocalAnalysisRepository } from './data/repositories/local-analysis.repository';
import { MockLanguageAnalysisService } from './features/analysis/services/mock-language-analysis.service';
import { MockScenarioService } from './features/scenarios/services/mock-scenario.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    ApiService,
    LocalChatRepository,
    LocalAnalysisRepository,
    MockLanguageAnalysisService,
    MockScenarioService,
  ],
};
