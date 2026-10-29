// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  EnvironmentProviders,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { FORMLY_CONFIG, provideFormlyCore } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';
import { NG_CORE_PROVIDED } from '@rero/ng-core';

import { registerNgCoreFormlyExtension } from './extensions';
import { withNgCoreFormly } from './formly-config';

/**
 * Provide the ng-core Formly configuration: field types, wrappers, extensions
 * and validation messages.
 *
 * It can be registered in the application providers, or in the providers of
 * the routes using forms only. The dialog service is provided again, so the
 * forms opened in a dialog see this Formly configuration.
 */
export function provideCoreFormly(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideFormlyCore(withNgCoreFormly()),
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerNgCoreFormlyExtension,
      deps: [TranslateService],
    },
    DialogService,
    provideEnvironmentInitializer(() => {
      if (isDevMode() && !inject(NG_CORE_PROVIDED, { optional: true })) {
        throw new Error('provideCoreFormly() requires provideCore() in the application providers.');
      }
    }),
  ]);
}
