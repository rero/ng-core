/*
 * RERO angular core
 * Copyright (C) 2020-2023 RERO
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
import localeEnGB from '@angular/common/locales/en-GB';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { Injectable } from '@angular/core';
import { TranslateService as NgxTranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { deLocale, enGbLocale, esLocale, frLocale, itLocale } from 'ngx-bootstrap/locale';
import { PrimeNGConfig } from 'primeng/api';
import { Observable } from 'rxjs';
import { CoreConfigService } from '../core-config.service';
import primeNgDe from './primeng/de.json';
import primeNgEn from './primeng/en.json';
import primeNgEs from './primeng/es.json';
import primeNgFr from './primeng/fr.json';
import primeNgIt from './primeng/it.json';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  languages = {
    de: { ngx: deLocale, angular: localeDe, primeng: primeNgDe },
    en: { ngx: enGbLocale, angular: localeEnGB, primeng: primeNgEn },
    es: { ngx: esLocale, angular: localeEs, primeng: primeNgEs },
    fr: { ngx: frLocale, angular: localeFr, primeng: primeNgFr },
    it: { ngx: itLocale, angular: localeIt, primeng: primeNgIt }
  };

  /**
   * Constructor.
   *
   * @param _translateService Translate service.
   * @param _coreConfigService Configuration service.
   * @param _bsLocaleService Bootstrap locale service.
   * @param _primeNgConfig PrimeNGConfig service.
   */
  constructor(
    private _translateService: NgxTranslateService,
    private _coreConfigService: CoreConfigService,
    private _bsLocaleService: BsLocaleService,
    private _primeNgConfig: PrimeNGConfig
  ) {
    this.init();
  }

  /**
   * Set the current language.
   *
   * @param language the language code in iso format
   * @returns an Observable of the translations
   */
  setLanguage(language: string): Observable<any> {
    moment.locale(language);
    this._bsLocaleService.use(language);
    this._primeNgConfig.setTranslation(this.languages[language].primeng);
    return this._translateService.use(language);
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
      || 'en-GB';
  }

  private init() {
    for (const [key, value] of Object.entries(this.languages)) {
      defineLocale(key, value.ngx);
      registerLocaleData(value.angular, key);
    }
    const languages: Array<string> = this._coreConfigService.languages;
    this._translateService.addLangs(languages);
    this._translateService.setDefaultLang(this._coreConfigService.defaultLanguage);
    this._primeNgConfig.setTranslation(this.languages[this._coreConfigService.defaultLanguage].primeng);
  }
}
