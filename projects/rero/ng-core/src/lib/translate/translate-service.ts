/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Inject, Injectable } from '@angular/core';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsLocaleService, deLocale, enGbLocale,
         frLocale, itLocale, defineLocale } from 'ngx-bootstrap';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { CoreConfigService } from '../core-config.service';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  languages = {
    de: { ngx: deLocale,    angular: localeDe },
    en: { ngx: enGbLocale,  angular: localeEn },
    fr: { ngx: frLocale,    angular: localeFr },
    it: { ngx: itLocale,    angular: localeIt }
  };

  constructor(
    @Inject(NgxTranslateService) private translateService,
    @Inject(CoreConfigService) private coreConfigService,
    @Inject(BsLocaleService) private bsLocaleService
  ) {
    this.init();
  }

  setLanguage(language: string) {
    this.translateService.use(language);
    moment.locale(language);
    this.bsLocaleService.use(language);
    return this;
  }

  getBrowserLang() {
    return this.translateService.getBrowserLang();
  }

  get currentLanguage(): string {
    return this.translateService.currentLang
           || this.coreConfigService.defaultLanguage
           || 'en';
  }

  private init() {
    for (const [key, value] of Object.entries(this.languages)) {
      defineLocale(key, value.ngx);
      registerLocaleData(value.angular, key);
    }
    const languages: Array<string> = this.coreConfigService.languages;
    this.translateService.addLangs(languages);
    this.translateService.setDefaultLang(this.coreConfigService.defaultLanguage);
    this.setLanguage(this.coreConfigService.defaultLanguage);
  }
}
