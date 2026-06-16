// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import de from '../../languages/de.json';
import en from '../../languages/en.json';
import fr from '../../languages/fr.json';
import it from '../../languages/it.json';

@Injectable({
  providedIn: 'root',
})
export class TranslateLanguageService {
  protected translateService: TranslateService = inject(TranslateService);

  // List of preferred languages
  static PREFERRED_LANGUAGES = ['eng', 'fre', 'ger', 'ita'];

  // Available languages (import)
  private _availableLanguages: Record<string, Record<string, string>> = { de, en, fr, it };

  /**
   * @param langCode - ISO 639-2 (3 characters)
   * @param language - ISO 639-1 (2 characters)
   * @return human language - string
   */
  translate(langCode: string, language?: string) {
    const lang = language || this.translateService.getCurrentLang();
    if (!(lang in this._availableLanguages)) {
      return langCode;
    }

    if (!(langCode in this._availableLanguages[lang])) {
      return langCode;
    }

    return this._availableLanguages[lang][langCode];
  }
}
