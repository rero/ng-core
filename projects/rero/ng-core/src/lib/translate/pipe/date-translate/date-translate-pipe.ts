// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateTranslate',
  pure: false,
})
export class DateTranslatePipe extends DatePipe implements PipeTransform {
  protected translateService: TranslateService = inject(TranslateService);

  transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  transform(
    value: Date | string | number | null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null {
    if (!locale) {
      locale = this.translateService.getCurrentLang();
    }

    if (locale === 'en') {
      locale = `${locale}-GB`;
    }

    return super.transform(value, format, timezone, locale);
  }
}
