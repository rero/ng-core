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
import { DatePipe } from '@angular/common';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateTranslate',
  pure: false, // required to update the value when the promise is resolved
})
export class DateTranslatePipe extends DatePipe implements PipeTransform {

  protected translateService: TranslateService = inject(TranslateService);

  transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string): string | null
  {
    if (!locale) {
      locale = this.translateService.currentLang;
    }

    if (locale === 'en') {
      locale = `${locale}-GB`;
    }

    return super.transform(value, format, timezone, locale);
  }
}
