/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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

import { ApplicationConfig, inject, provideEnvironmentInitializer } from '@angular/core';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';
import {
  CoreConfigService,
  CoreTranslateLoader,
  primeNGConfig,
  provideCore,
  RecordService,
  RemoteAutocompleteService,
} from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';
import { AppConfigService } from './app-config.service';
import { routes } from './app.routes';
import { RecordServiceMock } from './record/editor/record-service-mock';
import { RouteService } from './routes/route.service';
import { AppRemoteAutocompleteService } from './service/app-remote-autocomplete.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateLoader(CoreTranslateLoader),
    }),
    // TODO: to remove in 21
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig),
    {
      provide: CoreConfigService,
      useClass: AppConfigService,
    },
    {
      provide: RemoteAutocompleteService,
      useClass: AppRemoteAutocompleteService,
    },
    provideEnvironmentInitializer(() => {
      inject(RouteService).initializeRoutes();
    }),
    {
      provide: RecordService,
      useClass: RecordServiceMock,
    },
  ],
};
