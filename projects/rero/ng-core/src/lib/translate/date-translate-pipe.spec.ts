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
import { EventEmitter } from '@angular/core';
import { DateTranslatePipe } from './date-translate-pipe';
import { TranslateService } from './translate-service';

let dateTranslateService: DateTranslatePipe;

export interface LangChangeEvent {
  lang: string;
  translations: any;
}

class TranslateServiceMock {
  get onLangChange() {
    return new EventEmitter<LangChangeEvent>();
  }
  get currentLanguage() {
    return 'en';
  }
}

describe('DateTranslatePipePipe', () => {
  beforeEach(() => {
    dateTranslateService = new DateTranslatePipe(
      new TranslateServiceMock() as unknown as TranslateService
    );
  });

  it('create an instance', () => {
    const pipe = dateTranslateService;
    expect(pipe).toBeTruthy();
  });

  it('create an instance', () => {
    const pipe = dateTranslateService;
    expect(pipe.transform('2019-10-18 12:00:00')).toBe('Oct 18, 2019');
  });
});
