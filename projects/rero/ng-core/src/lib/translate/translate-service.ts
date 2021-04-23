/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEn from '@angular/common/locales/en';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { Injectable } from '@angular/core';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { deLocale, enGbLocale, frLocale, itLocale } from 'ngx-bootstrap/locale';
import { CoreConfigService } from '../core-config.service';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  languages = {
    de: { ngx: deLocale, angular: localeDe },
    en: { ngx: enGbLocale, angular: localeEn },
    fr: { ngx: frLocale, angular: localeFr },
    it: { ngx: itLocale, angular: localeIt }
  };

  /**
   * Constructor.
   *
   * @param _translateService Translate service.
   * @param _coreConfigService Configuration service.
   * @param _bsLocaleService Bootstrap locale service.
   */
  constructor(
    private _translateService: NgxTranslateService,
    private _coreConfigService: CoreConfigService,
    private _bsLocaleService: BsLocaleService
  ) {
    this.init();
  }

  setLanguage(language: string) {
    this._translateService.use(language);
    moment.locale(language);
    this._bsLocaleService.use(language);
    return this;
  }

  /**
   * Return the translation of the given label.
   * Proxy for "instant" method of the translate service of ngx-translate.
   * @param key String to translate.
   * @param interpolateParams Parameters to interpolate.
   * @return Translated value as string.
   */
  translate(key: string | Array<string>, interpolateParams: any = null): string {
    return this._translateService.instant(key, interpolateParams);
  }

  getBrowserLang() {
    return this._translateService.getBrowserLang();
  }

  get currentLanguage(): string {
    return this._translateService.currentLang
      || this._coreConfigService.defaultLanguage
      || 'en';
  }

  private init() {
    for (const [key, value] of Object.entries(this.languages)) {
      defineLocale(key, value.ngx);
      registerLocaleData(value.angular, key);
    }
    const languages: Array<string> = this._coreConfigService.languages;
    this._translateService.addLangs(languages);
    this._translateService.setDefaultLang(this._coreConfigService.defaultLanguage);
    this.setLanguage(this._coreConfigService.defaultLanguage);
  }
}
