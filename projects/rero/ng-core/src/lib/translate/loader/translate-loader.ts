// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CoreConfigService } from '../../core';
import de from '../i18n/de.json' with { type: 'json' };
import en from '../i18n/en.json' with { type: 'json' };
import fr from '../i18n/fr.json' with { type: 'json' };
import it from '../i18n/it.json' with { type: 'json' };

/**
 * Loader for translations used in ngx-translate library.
 */
@Injectable()
export class CoreTranslateLoader implements TranslateLoader {
  // prefix: string;
  // suffix: string;
  // enforceLoading: boolean;
  // useHttpBackend: boolean;

  protected coreConfigService: CoreConfigService = inject(CoreConfigService);
  protected http: HttpClient = inject(HttpClient);

  // translations
  private translations: Record<string, Record<string, string>> = {};

  // locale translations
  // with angular<9 assets are not available for libraries
  // See: https://angular.io/guide/creating-libraries#managing-assets-in-a-library
  private coreTranslations: Record<string, Record<string, string>> = { de, en, fr, it };

  /**
   * Return observable used by ngx-translate to get translations.
   * @param lang - string, language to retrieve translations from.
   */
  getTranslation(lang: string): Observable<TranslationObject> {
    // Already in cache
    if (this.translations[lang] != null) {
      return of(this.translations[lang]);
    }

    const urls: string[] = this.coreConfigService.translationsURLs;

    // create the list of http requests
    const observers = urls.map((url) => {
      const langURL = url.replace('${lang}', lang);
      return this.http.get<Record<string, string>>(langURL).pipe(
        catchError(() => {
          console.log(`ERROR: Cannot load translation: ${langURL}`);
          return of({});
        }),
      );
    });
    // Get local and backend translations
    return forkJoin(observers).pipe(
      map((translations) => {
        // copy local translations
        if (this.coreTranslations[lang] != null) {
          this.translations[lang] = { ...this.coreTranslations[lang] };
        } else {
          this.translations[lang] = {};
        }
        // get remote translations
        translations.forEach((trans) => {
          this.translations[lang] = {
            ...this.translations[lang],
            ...trans,
          };
        });
        return this.translations[lang];
      }),
    );
  }
}
