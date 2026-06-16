// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en-GB';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { inject, Injectable } from '@angular/core';
import { InterpolatableTranslationObject, TranslateService } from '@ngx-translate/core';
import { Settings } from 'luxon';
import { de } from 'primelocale/js/de.js';
import { en } from 'primelocale/js/en.js';
import { fr } from 'primelocale/js/fr.js';
import { it } from 'primelocale/js/it.js';
import { PrimeNG } from 'primeng/config';
import { Observable } from 'rxjs';
import { CoreConfigService } from '../../../core/service/core-config/core-config.service';
import { Translation } from 'primeng/api';

type Locales = Record<
  string,
  {
    angular: unknown;
    primeng: Translation;
  }
>;

@Injectable({
  providedIn: 'root',
})
export class NgCoreTranslateService extends TranslateService {
  protected primeNG: PrimeNG = inject(PrimeNG);
  protected coreConfigService: CoreConfigService = inject(CoreConfigService);

  private locales: Locales = {
    de: { angular: localeDe, primeng: de },
    en: { angular: localeEn, primeng: en },
    fr: { angular: localeFr, primeng: fr },
    it: { angular: localeIt, primeng: it },
  };

  constructor() {
    super();
    for (const [key, value] of Object.entries(this.locales)) {
      registerLocaleData(value.angular, key);
    }
    const languages: string[] = this.coreConfigService.languages;
    super.addLangs(languages);

    super.setFallbackLang(this.coreConfigService.defaultLanguage);
    if (!super.getCurrentLang()) {
      super.use(this.coreConfigService.defaultLanguage);
    }
  }

  use(lang: string): Observable<InterpolatableTranslationObject> {
    Settings.defaultLocale = lang;
    if (this.locales[lang]) {
      this.primeNG.setTranslation(this.locales[lang].primeng);
    }
    return super.use(lang);
  }
}
