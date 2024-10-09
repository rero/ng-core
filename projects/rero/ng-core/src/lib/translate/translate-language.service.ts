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
import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
// TODO: Search for a better solution for dynamic file loading
import de from './languages/de.json';
import en from './languages/en.json';
import fr from './languages/fr.json';
import it from './languages/it.json';

@Injectable({
  providedIn: 'root',
})
export class TranslateLanguageService {

  protected translateService: TranslateService = inject(TranslateService);

  // List of preferred languages
  static PREFERRED_LANGUAGES = ['eng', 'fre', 'ger', 'ita'];

  // Available languages (import)
  private _availableLanguages = { de, en, fr, it };

  /**
   * @param langCode - ISO 639-2 (3 characters)
   * @param language - ISO 639-1 (2 characters)
   * @return human language - string
   */
  translate(langCode: string, language?: string) {
    const lang = language || this.translateService.currentLang;
    if (!(lang in this._availableLanguages)) {
      return langCode;
    }

    if (!(langCode in this._availableLanguages[lang])) {
      return langCode;
    }

    return this._availableLanguages[lang][langCode];
  }
}
