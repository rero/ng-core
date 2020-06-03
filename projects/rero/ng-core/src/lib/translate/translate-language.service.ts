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
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SelectOption } from '../record/editor/interfaces';
// TODO: Search for a better solution for dynamic file loading
import de from './languages/de.json';
import en from './languages/en.json';
import fr from './languages/fr.json';
import it from './languages/it.json';

@Injectable({
  providedIn: 'root'
})
export class TranslateLanguageService implements OnDestroy {
  // List of preferred languages
  static PREFERRED_LANGUAGES = ['eng', 'fre', 'ger', 'ita'];

  // Available languages (import)
  private _availableLanguages = { de, en, fr, it };

  // List of options for populating the select box. The options are stored to
  // avoid a repetitive treatment, as the language select box may appear several
  // times in the application.
  private _selectOptions: Array<SelectOption> = null;

  // Subscription to language changes
  private _changeLanguageSubscription: Subscription = null;

  /**
   * Constructor.
   *
   * Subscribes to language changes and resets the stored options after a
   * change.
   *
   * @param _translateService - TranslateService
   */
  constructor(private _translateService: TranslateService) {
    // When language is changed, we reset the stored select options.
    this._changeLanguageSubscription = this._translateService.onLangChange.subscribe(() => {
      this._selectOptions = null;
    });
  }

  /**
   * Service destruction
   *
   * Unsubscribe from language changes.
   */
  ngOnDestroy() {
    this._changeLanguageSubscription.unsubscribe();
  }

  /**
   * @param langCode - ISO 639-2 (3 characters)
   * @param language - ISO 639-1 (2 characters)
   * @return human language - string
   */
  translate(langCode: string, language?: string) {
    const lang = language ? language : this._translateService.currentLang;
    if (!(lang in this._availableLanguages)) {
      return langCode;
    }

    if (!(langCode in this._availableLanguages[lang])) {
      return langCode;
    }

    return this._availableLanguages[lang][langCode];
  }

  /**
   * Return select options with the translated language value as label.
   * @param values Language codes values
   * @return List of options
   */
  getSelectOptions(values: Array<string>): Array<SelectOption> {
    if (this._selectOptions !== null) {
      return this._selectOptions;
    }

    const options: Array<SelectOption> = values.map((item) => {
      return { label: this.translate(item), value: item, group: '------------' };
    });

    this._selectOptions = options.sort((a: SelectOption, b: SelectOption) => {
      return a.label.localeCompare(b.label);
    });

    TranslateLanguageService.PREFERRED_LANGUAGES.reverse().forEach((lang: string) => {
      this._selectOptions.unshift({
        label: this.translate(lang),
        value: lang
      });
    });

    return this._selectOptions;
  }
}
