// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateLanguageService } from '../../service/translate-language/translate-language.service';

@Pipe({
  name: 'translateLanguage',
  pure: false,
})
export class TranslateLanguagePipe implements PipeTransform {
  protected translateLanguage: TranslateLanguageService = inject(TranslateLanguageService);
  private currentLang = toSignal(inject(TranslateService).onLangChange);

  /**
   * transform language code to human language
   * @param langCode - ISO 639-2 (3 characters)
   * @param language - ISO 639-1 (2 characters)
   */
  transform(langCode: string, language?: string): string {
    // pure: false already re-evaluates transform() on every change detection
    // cycle; reading these signals here is enough to pick up language changes,
    // no manual markForCheck() needed.
    this.currentLang();
    this.translateLanguage.languagesVersion();
    return this.translateLanguage.translate(langCode, language);
  }
}
