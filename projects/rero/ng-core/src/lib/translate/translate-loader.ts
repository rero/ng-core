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
import { HttpClient } from '@angular/common/http';
import { TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoreConfigService } from '../core-config.service';
import de from './i18n/de.json';
import en from './i18n/en.json';
import fr from './i18n/fr.json';
import it from './i18n/it.json';

/**
 * Loader for translations used in ngx-translate library.
 */
export class TranslateLoader implements BaseTranslateLoader {

  // translations
  private _translations = {};

  // locale translations
  // with angular<9 assets are not available for libraries
  // See: https://angular.io/guide/creating-libraries#managing-assets-in-a-library
  private _coreTranslations = { de, en, fr, it };
  /**
   * Constructor.
   *
   * @param _coreConfigService Configuration service.
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _http: HttpClient
  ) { }

  /**
   * Return observable used by ngx-translate to get translations.
   * @param lang - string, language to rerieve translations from.
   */
  getTranslation(lang: string): Observable<any> {
    // Already in cache
    if (this._translations[lang] != null) {
      return of(this._translations[lang]);
    }
    const urls = this._coreConfigService.translationsURLs;
    // create the list of http requests
    const observers = urls.map(
      url => {
        const langURL = url.replace('${lang}', lang);
        return this._http.get(langURL).pipe(
          catchError((err) => {
            console.log(`ERROR: Cannot load translation: ${langURL}`);
            return of([]);
          })
        );
      }
    );
    // Get local and backend translations
    return forkJoin(observers).pipe(
      map((translations) => {
        // copy local translations
        if (this._coreTranslations[lang] != null) {
          this._translations[lang] = { ...this._coreTranslations[lang] };
        }
        // get remote translations
        translations.map(trans =>
          this._translations[lang] = {
            ...this._translations[lang],
            ...trans
          }
        );
        return this._translations[lang];
      })
    );
  }
}
