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
import { BrowserModule } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

import { TranslateLanguagePipe } from './translate-language.pipe';

describe('TranslateLanguagePipe', () => {
  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          BrowserModule
        ]
      });
  });

  it('should return lang text', () => {
    const langText = 'French';

    const translateLanguageServiceSpy = jasmine.createSpyObj('TranslateLanguageService', ['translate']);
    translateLanguageServiceSpy.translate.and.returnValue(langText);

    const pipe = new TranslateLanguagePipe(translateLanguageServiceSpy);

    expect(pipe.transform('fr', 'en')).toBe(langText);
  });
});
