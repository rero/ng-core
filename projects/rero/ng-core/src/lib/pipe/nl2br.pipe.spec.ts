/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { SecurityContext } from '@angular/core';
import { DomSanitizer, BrowserModule, ɵDomSanitizerImpl } from '@angular/platform-browser';
import { inject, TestBed } from '@angular/core/testing';
import { Nl2brPipe } from './nl2br.pipe';

describe('Nl2brPipe', () => {
  const sanitizer: DomSanitizer = new ɵDomSanitizerImpl(null);

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          BrowserModule
        ]
      });
  });

  it('convert carriage return to <br> html tags', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new Nl2brPipe(domSanitizer);
    const safeText = pipe.transform('Text with\ncarriage return');
    const sanitizedValue = sanitizer.sanitize(SecurityContext.HTML, safeText);

    expect(sanitizedValue).toBe('Text with<br>\ncarriage return');
  }));

  it('should return empty string', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const text: string = null;
    const pipe = new Nl2brPipe(domSanitizer);
    const safeText = pipe.transform(text);
    const sanitizedValue = sanitizer.sanitize(SecurityContext.HTML, safeText);

    expect(sanitizedValue).toBe('');
  }));
});
