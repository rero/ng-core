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
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateLanguageService } from './translate-language.service';

@Pipe({
    name: 'translateLanguage',
    standalone: false
})
export class TranslateLanguagePipe implements PipeTransform {

  protected translateLanguage: TranslateLanguageService = inject(TranslateLanguageService);

  /**
   * transform language code to human language
   * @param langCode - ISO 639-2 (3 characters)
   * @param language - ISO 639-1 (2 characters)
   */
  transform(langCode: string, language?: string): string {
    return this.translateLanguage.translate(langCode, language);
  }
}
