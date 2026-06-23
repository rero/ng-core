// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import en from '../../languages/en.json';

export type LanguageMap = Record<string, Record<string, string>>;
export type LanguageLoaderFn = () => Promise<Record<string, string>>;

export const CORE_LANGUAGE_LOADERS: LanguageMap = { en };

@Injectable({
  providedIn: 'root',
})
export class TranslateLanguageService {
  protected translateService = inject(TranslateService);

  protected availableLanguages: LanguageMap = { ...CORE_LANGUAGE_LOADERS };

  readonly languagesVersion = signal(0);

  /**
   * @param langCode - ISO 639-2 (3 characters)
   * @param language - ISO 639-1 (2 characters)
   * @return human language - string
   */
  async loadLanguages(loaders: Record<string, LanguageLoaderFn>): Promise<void> {
    const entries = await Promise.all(
      Object.entries(loaders).map(async ([lang, loader]) => [lang, await loader()] as [string, Record<string, string>]),
    );
    for (const [lang, data] of entries) {
      this.availableLanguages[lang] = data;
    }
    this.languagesVersion.update(v => v + 1);
  }

  translate(langCode: string, language?: string) {
    const lang = language || this.translateService.getCurrentLang();
    const map = this.availableLanguages[lang] ?? this.availableLanguages['en'];

    if (!map || !(langCode in map)) {
      return langCode;
    }

    return map[langCode];
  }
}
