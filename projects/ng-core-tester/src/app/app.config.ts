// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideOptimus } from '@openng/optimus-ui/config';
import {
  CoreConfigService,
  httpPendingInterceptor,
  NgCoreTranslateService,
  optimusUIConfig,
  provideCore,
  RecordService,
  TranslateLanguageService,
} from '@rero/ng-core';
import { withBarcodeScanner } from '@rero/ng-core/barcode-scanner';
import { provideCoreFormly, RemoteAutocompleteService } from '@rero/ng-core/editor';

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
    provideCore(withBarcodeScanner()),
    provideCoreFormly(),
    provideRouter(routes, withRouterConfig({ canceledNavigationResolution: 'computed' })),
    provideHttpClient(withInterceptors([httpPendingInterceptor])),
    provideTranslateService({
      loader: provideTranslateLoader(AppTranslateLoader),
    }),
    provideAppInitializer(() => inject(AppInitializerService).initialize()),
    { provide: TranslateService, useExisting: AppTranslateService },
    { provide: NgCoreTranslateService, useExisting: AppTranslateService },
    { provide: TranslateLanguageService, useExisting: AppTranslateLanguageService },
    provideOptimus(optimusUIConfig),
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
