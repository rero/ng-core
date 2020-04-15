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
import { DatePipe } from '@angular/common';
import { Inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'dateTranslate',
  pure: false // required to update the value when the promise is resolved
})
export class DateTranslatePipe extends DatePipe implements PipeTransform {
  /**
   * Constructor.
   *
   * @param _translateService Translate service.
   */
  constructor(@Inject(TranslateService) private _translateService: TranslateService) {
    super(_translateService.currentLang);
  }

  transform(value: any, format = 'mediumDate', timezone?: string, locale?: string): string {
    let tlocale = (locale) ? locale : this._translateService.currentLang;
    this._translateService.onLangChange.subscribe(() => {
      tlocale = (locale) ? locale : this._translateService.currentLang;
      return super.transform(value, format, timezone, tlocale);
    });

    return super.transform(value, format, timezone, tlocale);
  }
}
