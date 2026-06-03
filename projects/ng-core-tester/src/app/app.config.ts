/*
 * RERO angular core
 * Copyright (C) 2020-2026 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, inject, provideEnvironmentInitializer } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import {
  CoreConfigService,
  CoreTranslateLoader,
  NgCoreTranslateService,
  primeNGConfig,
  provideCore,
  RecordService,
  RemoteAutocompleteService,
} from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { routes } from './app.routes';
import { RecordServiceMock } from './record/editor/record-service-mock';
import { AppRemoteAutocompleteService } from './service/app-remote-autocomplete.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateLoader(CoreTranslateLoader),
    }),
    provideEnvironmentInitializer(async () => {
      const translateService = inject(TranslateService);
      const configService = inject(CoreConfigService);
      const availableLanguages: string[] = configService.languages ?? ['en'];
      const browserLang = navigator.language.split('-')[0];
      const lang = availableLanguages.includes(browserLang) ? browserLang : availableLanguages[0];
      await firstValueFrom(translateService.use(lang));
    }),
    { provide: TranslateService, useExisting: NgCoreTranslateService },
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
