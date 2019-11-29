/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// TODO: Search for a better solution for dynamic file loading
import de from './languages/de.json';
import en from './languages/en.json';
import fr from './languages/fr.json';
import it from './languages/it.json';

@Injectable({
  providedIn: 'root'
})
export class TranslateLanguageService {

  /**
   * Available languages (import)
   */
  private availableLanguages = { de, en, fr, it };

  /**
   * Constructor
   * @param translateService - TranslateService
   */
  constructor(private translateService: TranslateService) { }

  /**
   * @param langCode - ISO 639-2 (2 characters)
   * @param language - ISO 639-1 (2 characters)
   * @return human language - string
   */
  translate(langCode: string, language?: string) {
    const lang = language ? language : this.translateService.currentLang;
    if (!(lang in this.availableLanguages)) {
      return langCode;
    }

    if (!(langCode in this.availableLanguages[lang])) {
      return langCode;
    }

    return this.availableLanguages[lang][langCode];
  }
}
