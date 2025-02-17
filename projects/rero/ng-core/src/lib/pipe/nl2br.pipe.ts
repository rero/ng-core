/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Pipe for converting carriage returns to <br> html entities.
 */
@Pipe({
    name: 'nl2br',
    standalone: false
})
export class Nl2brPipe implements PipeTransform {

  protected sanitizer: DomSanitizer = inject(DomSanitizer);

  /**
   * Returns transformed value containing <br> entities.
   *
   * @param value Value to transform.
   * @return Transformed value.
   */
  transform(value?: string): any {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    return this.sanitizer.bypassSecurityTrustHtml(
      value.replace(/\r\n?|\n/g, '<br>\n')
    );
  }
}
