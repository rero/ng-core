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
import { TestBed } from '@angular/core/testing';

import { TranslateLanguageService } from './translate-language.service';
import { TranslateService } from '@ngx-translate/core';

describe('TranslateLanguageService', () => {

  const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['currentLang']);
  translateServiceSpy.currentLang = 'fr';

  let service: TranslateLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TranslateService, useValue: translateServiceSpy },
      ]
    });

    service = TestBed.get(TranslateLanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should translate language code hat to human language french', () => {
    expect(service.translate('hat')).toBe('créole haïtien');
  });

  it('should translate language code hat to human language english', () => {
    expect(service.translate('hat', 'en')).toBe('Haitian French Creole');
  });
});
