// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { FORMLY_CONFIG, provideFormlyCore } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { registerNgCoreFormlyExtension } from '../formly/config/extensions';
import { withNgCoreFormly } from '../formly/config/formly-config';
import { NgCoreTranslateService } from '../translate/service/translate/translate-service';
import { PageTitleStrategy } from './service/page-title-strategy/page-title-strategy';

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ConfirmationService,
    DialogService,
    MessageService,
    provideFormlyCore(withNgCoreFormly()),
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerNgCoreFormlyExtension,
      deps: [TranslateService],
    },
    {
      provide: TitleStrategy,
      useClass: PageTitleStrategy,
    },
    {
      provide: TranslateService,
      useClass: NgCoreTranslateService,
    },
  ]);
}
