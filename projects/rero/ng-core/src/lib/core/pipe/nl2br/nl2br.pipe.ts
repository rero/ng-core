// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Pipe for converting carriage returns to <br> html entities.
 */
@Pipe({ name: 'nl2br' })
export class Nl2brPipe implements PipeTransform {
  protected sanitizer: DomSanitizer = inject(DomSanitizer);

  /**
   * Returns transformed value containing <br> entities.
   *
   * @param value Value to transform.
   * @return Transformed value.
   */
  transform(value: string): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/\r\n?|\n/g, '<br>\n'));
  }
}
