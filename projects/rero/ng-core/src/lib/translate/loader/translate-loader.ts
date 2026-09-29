// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ALLOW_HTTP_CACHE, CoreConfigService } from '../../core';

export type TranslationLoaderFn = () => Promise<{ default: Record<string, string> }>;

// Only 'en' is bundled in the lib. Additional languages must be added by the consuming app
// via a subclass that overrides `coreTranslationLoaders`. Dynamic import paths with template
// literals (e.g. `import(\`../${lang}.json\`)`) are not statically analysable by esbuild and
// are therefore rejected at build time — each language must be an explicit import thunk.
export const CORE_TRANSLATION_LOADERS: Record<string, TranslationLoaderFn> = {
  en: () => import('../i18n/en.json'),
};

/**
 * Append the version as query parameter to bust the browser HTTP cache
 * when a new version is deployed.
 * @param url - the URL of a static file.
 * @param version - the version; the URL is returned unchanged when empty.
 */
export function versionedUrl(url: string, version: string): string {
  if (!version) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

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

    const { translationsURLs, translationsVersion } = this.coreConfigService;

    const coreTranslation$ = this.coreTranslationLoaders[lang]
      ? from(this.coreTranslationLoaders[lang]()).pipe(
          map((m) => m.default),
          catchError(() => of({} as Record<string, string>)),
        )
      : of({} as Record<string, string>);

    const remote$ = translationsURLs.length
      ? forkJoin(
          translationsURLs.map((entry) => {
            const { url, versioned } = typeof entry === 'string' ? { url: entry, versioned: false } : entry;
            let langURL = url.replace('${lang}', lang);
            let context: HttpContext | undefined;
            // A static file can only be cached safely when its URL changes with each version.
            if (versioned && translationsVersion) {
              langURL = versionedUrl(langURL, translationsVersion);
              context = new HttpContext().set(ALLOW_HTTP_CACHE, true);
            }
            return this.http.get<Record<string, string>>(langURL, { context }).pipe(
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
