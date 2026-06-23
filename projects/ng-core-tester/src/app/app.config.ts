// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  CoreConfigService, httpPendingInterceptor, NgCoreTranslateService, primeNGConfig,
  provideCore,
  RecordService,
  RemoteAutocompleteService, TranslateLanguageService
} from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';
import { AppConfigService } from './app-config.service';
import { AppTranslateLoader } from './app-translate-loader';
import { AppTranslateService } from './app-translate.service';
import { routes } from './app.routes';
import { RecordServiceMock } from './record/editor/record-service-mock';
import { AppInitializerService } from './service/app-initializer.service';
import { AppRemoteAutocompleteService } from './service/app-remote-autocomplete.service';
import { AppTranslateLanguageService } from './service/app-translate-language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpPendingInterceptor])),
    provideTranslateService({
      loader: provideTranslateLoader(AppTranslateLoader),
    }),
    provideAppInitializer(() => inject(AppInitializerService).initialize()),
    { provide: TranslateService, useExisting: AppTranslateService },
    { provide: NgCoreTranslateService, useExisting: AppTranslateService },
    { provide: TranslateLanguageService, useExisting: AppTranslateLanguageService },
    provideAnimations(),
    providePrimeNG(primeNGConfig),
    {
      provide: CoreConfigService,
      useExisting: AppConfigService,
    },
    {
      provide: RemoteAutocompleteService,
      useExisting: AppRemoteAutocompleteService,
    },
    {
      provide: RecordService,
      useExisting: RecordServiceMock,
    },
  ],
};
