// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CoreConfigService } from '../../core';

export type TranslationLoaderFn = () => Promise<{ default: Record<string, string> }>;

// Only 'en' is bundled in the lib. Additional languages must be added by the consuming app
// via a subclass that overrides `coreTranslationLoaders`. Dynamic import paths with template
// literals (e.g. `import(\`../${lang}.json\`)`) are not statically analysable by esbuild and
// are therefore rejected at build time — each language must be an explicit import thunk.
export const CORE_TRANSLATION_LOADERS: Record<string, TranslationLoaderFn> = {
  en: () => import('../i18n/en.json'),
};

@Injectable()
export class CoreTranslateLoader implements TranslateLoader {
  protected coreConfigService: CoreConfigService = inject(CoreConfigService);
  protected http: HttpClient = inject(HttpClient);

  // Explicit map so the bundler can statically analyse import paths.
  // Override in subclasses to add or replace languages.
  protected coreTranslationLoaders: Record<string, TranslationLoaderFn> = { ...CORE_TRANSLATION_LOADERS };

  private translations: Record<string, Record<string, string>> = {};

  /**
   * Return observable used by ngx-translate to get translations.
   * @param lang - string, language to retrieve translations from.
   */
  getTranslation(lang: string): Observable<TranslationObject> {
    if (this.translations[lang] != null) {
      return of(this.translations[lang]);
    }

    const urls: string[] = this.coreConfigService.translationsURLs;

    const coreTranslation$ = this.coreTranslationLoaders[lang]
      ? from(this.coreTranslationLoaders[lang]()).pipe(
          map((m) => m.default),
          catchError(() => of({} as Record<string, string>)),
        )
      : of({} as Record<string, string>);

    const remote$ = urls.length
      ? forkJoin(
          urls.map((url) => {
            const langURL = url.replace('${lang}', lang);
            return this.http.get<Record<string, string>>(langURL).pipe(
              catchError(() => {
                console.log(`ERROR: Cannot load translation: ${langURL}`);
                return of({} as Record<string, string>);
              }),
            );
          }),
        )
      : of([] as Record<string, string>[]);

    return coreTranslation$.pipe(
      switchMap((core) =>
        remote$.pipe(
          map((remotes) => {
            this.translations[lang] = Object.assign({}, core, ...remotes);
            return this.translations[lang];
          }),
        ),
      ),
    );
  }
}
