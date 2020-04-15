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
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Pipe for converting carriage returns to <br> html entities.
 */
@Pipe({ name: 'nl2br' })
export class Nl2brPipe implements PipeTransform {
  /**
   * Constructor.
   *
   * @param _sanitizer Dom sanitizer.
   */
  constructor(private _sanitizer: DomSanitizer) { }

  /**
   * Returns transformed value containing <br> entities.
   *
   * @param value Value to transform.
   * @return Transformed value.
   */
  transform(value: string): any {
    if (!value) {
      return this._sanitizer.bypassSecurityTrustHtml('');
    }
    return this._sanitizer.bypassSecurityTrustHtml(
      value.replace(/\r\n?|\n/g, '<br>\n')
    );
  }
}
