// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders, Provider } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from '@openng/optimus-ui/api';
import { DialogService } from '@openng/optimus-ui/dynamicdialog';

import { NgCoreTranslateService } from '../translate/service/translate/translate-service';
import { PageTitleStrategy } from './service/page-title-strategy/page-title-strategy';

/**
 * Set by provideCore(), so the optional providers can check it is registered.
 */
export const NG_CORE_PROVIDED = new InjectionToken<boolean>('NG_CORE_PROVIDED');

/**
 * Optional feature of provideCore(), such as withBarcodeScanner() of
 * @rero/ng-core/barcode-scanner.
 */
export interface CoreFeature {
  ɵkind: string;
  ɵproviders: Provider[];
}

export function provideCore(...features: CoreFeature[]): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NG_CORE_PROVIDED, useValue: true },
    ConfirmationService,
    DialogService,
    MessageService,
    {
      provide: TitleStrategy,
      useClass: PageTitleStrategy,
    },
    {
      provide: TranslateService,
      useClass: NgCoreTranslateService,
    },
    ...features.flatMap((feature) => feature.ɵproviders),
  ]);
}
