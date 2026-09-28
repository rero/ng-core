// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en-GB';
import { inject, Service } from '@angular/core';
import { InterpolatableTranslationObject, TranslateService } from '@ngx-translate/core';
import { Settings } from 'luxon';
import { en } from '@openng/optimus-ui-locale/js/en.js';
import { Translation } from '@openng/optimus-ui/api';
import { Optimus } from '@openng/optimus-ui/config';
import { Observable } from 'rxjs';
import { CoreConfigService } from '../../../core/service/core-config/core-config.service';

export type Locales = Record<
  string,
  {
    angular: unknown;
    optimusUI: Translation;
  }
>;

// Only 'en' is bundled in the lib. Angular locale data and Optimus UI translations cannot be
// loaded via HTTP — they are compiled JS modules that must be statically imported and registered
// via registerLocaleData(). Consuming apps must extend NgCoreTranslateService and override
// `locales` to add their required languages.
export const CORE_LOCALES: Locales = {
  en: { angular: localeEn, optimusUI: en },
};

@Service()
export class NgCoreTranslateService extends TranslateService {
  protected optimusUI: Optimus = inject(Optimus);
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
      this.optimusUI.setTranslation(this.locales[lang].optimusUI);
    }
    return super.use(lang);
  }
}
