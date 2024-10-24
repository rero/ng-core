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
import { TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { Nl2brPipe } from './nl2br.pipe';

describe('Nl2brPipe', () => {
  let pipe: Nl2brPipe;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          BrowserModule
        ],
        providers: [
          Nl2brPipe,
          { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: (val: string) => val } }
        ]
      });
    pipe = TestBed.inject(Nl2brPipe);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('convert carriage return to <br> html tags', () => {
    const safeText = pipe.transform('Text with\ncarriage return');
    expect(safeText).toBe('Text with<br>\ncarriage return')
  });

  it('should return empty string', () => {
    const safeText = pipe.transform(null);
    expect(safeText).toBe('');
  });
});
