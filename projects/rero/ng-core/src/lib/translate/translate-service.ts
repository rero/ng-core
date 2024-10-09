/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en-GB';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import moment from "moment";
import de from 'primelocale/de.json';
import en from 'primelocale/en.json';
import fr from 'primelocale/fr.json';
import it from 'primelocale/it.json';
import { PrimeNGConfig } from "primeng/api";
import { Observable } from "rxjs";
import { CoreConfigService } from "../core-config.service";
import { registerLocaleData } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NgCoreTranslateService extends TranslateService {

  protected primengConfig: PrimeNGConfig = inject(PrimeNGConfig);
  protected coreConfigService: CoreConfigService = inject(CoreConfigService);

  private locales = {
    de: { angular: localeDe, primeng: de },
    en: { angular: localeEn, primeng: en },
    fr: { angular: localeFr, primeng: fr },
    it: { angular: localeIt, primeng: it }
  };

  initialize(): void {
    for (const [key, value] of Object.entries(this.locales)) {
      registerLocaleData(value.angular, key);
    }
    const languages: string[] = this.coreConfigService.languages;
    super.addLangs(languages);

    super.onLangChange.subscribe(translation => {
      this.use(translation.lang);
    });
    super.setDefaultLang(this.coreConfigService.defaultLanguage);
    if (!super.currentLang) {
      super.use(this.coreConfigService.defaultLanguage);
    }
  }

  use(lang: string): Observable<any> {
    moment.locale(lang);
    this.primengConfig.setTranslation(this.locales[lang].primeng[lang]);

    return super.use(lang);
  }
}
