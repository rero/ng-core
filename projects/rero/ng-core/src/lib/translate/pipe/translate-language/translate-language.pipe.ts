// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateLanguageService } from '../../service/translate-language/translate-language.service';

@Pipe({
  name: 'translateLanguage',
  pure: false,
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
