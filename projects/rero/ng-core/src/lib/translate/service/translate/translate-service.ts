// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en-GB';
import { inject, Injectable } from '@angular/core';
import { InterpolatableTranslationObject, TranslateService } from '@ngx-translate/core';
import { Settings } from 'luxon';
import { en } from 'primelocale/js/en.js';
import { Translation } from 'primeng/api';
import { PrimeNG } from 'primeng/config';
import { Observable } from 'rxjs';
import { CoreConfigService } from '../../../core/service/core-config/core-config.service';

export type Locales = Record<
  string,
  {
    angular: unknown;
    primeng: Translation;
  }
>;

// Only 'en' is bundled in the lib. Angular locale data and PrimeNG translations cannot be
// loaded via HTTP — they are compiled JS modules that must be statically imported and registered
// via registerLocaleData(). Consuming apps must extend NgCoreTranslateService and override
// `locales` to add their required languages.
export const CORE_LOCALES: Locales = {
  en: { angular: localeEn, primeng: en },
};

@Injectable({
  providedIn: 'root',
})
export class NgCoreTranslateService extends TranslateService {
  protected primeNG: PrimeNG = inject(PrimeNG);
  protected coreConfigService: CoreConfigService = inject(CoreConfigService);

  protected locales: Locales = { ...CORE_LOCALES };

  constructor() {
    super();
    super.setFallbackLang(this.coreConfigService.defaultLanguage);
  }

  use(lang: string): Observable<InterpolatableTranslationObject> {
    Settings.defaultLocale = lang;
    if (this.locales[lang]) {
      registerLocaleData(this.locales[lang].angular, lang);
      this.primeNG.setTranslation(this.locales[lang].primeng);
    }
    return super.use(lang);
  }
}
