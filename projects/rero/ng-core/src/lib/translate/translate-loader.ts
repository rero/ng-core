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
import { HttpClient } from '@angular/common/http';
import { TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoreConfigService } from '../core-config.service';
import de from './i18n/de.json';
import en from './i18n/en.json';
import fr from './i18n/fr.json';
import it from './i18n/it.json';
import { inject } from '@angular/core';

/**
 * Loader for translations used in ngx-translate library.
 */
export class TranslateLoader implements BaseTranslateLoader {

  protected coreConfigService: CoreConfigService = inject(CoreConfigService);
  protected http: HttpClient = inject(HttpClient);

  // translations
  private translations = {};

  // locale translations
  // with angular<9 assets are not available for libraries
  // See: https://angular.io/guide/creating-libraries#managing-assets-in-a-library
  private coreTranslations = { de, en, fr, it };

  /**
   * Return observable used by ngx-translate to get translations.
   * @param lang - string, language to retrieve translations from.
   */
  getTranslation(lang: string): Observable<any> {
    // Already in cache
    if (this.translations[lang] != null) {
      return of(this.translations[lang]);
    }
    const urls = this.coreConfigService.translationsURLs;
    // create the list of http requests
    const observers = urls.map(
      url => {
        const langURL = url.replace('${lang}', lang);
        return this.http.get(langURL).pipe(
          catchError(() => {
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
        if (this.coreTranslations[lang] != null) {
          this.translations[lang] = { ...this.coreTranslations[lang] };
        }
        // get remote translations
        translations.map(trans =>
          this.translations[lang] = {
            ...this.translations[lang],
            ...trans
          }
        );
        return this.translations[lang];
      })
    );
  }
}
