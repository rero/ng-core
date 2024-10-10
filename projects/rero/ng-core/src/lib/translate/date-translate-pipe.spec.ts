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
import { TranslateModule } from '@ngx-translate/core';
import { DateTranslatePipe } from './date-translate-pipe';
import { NgCoreTranslateService } from './translate-service';

describe('DateTranslatePipePipe', () => {
  let pipe: DateTranslatePipe;
  let service: NgCoreTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        DateTranslatePipe
      ]
    });
    service = TestBed.inject(NgCoreTranslateService);
    service.initialize();
    pipe = TestBed.inject(DateTranslatePipe);
  });

  it('should return the english translation of the date (default)', () => {
    expect(pipe.transform('2019-10-18 12:00:00')).toBe('18 Oct 2019');
  });

  it('should return the French translation of the date', () => {
    service.use('fr');
    expect(pipe.transform('2019-10-18 12:00:00')).toBe('18 oct. 2019');
  });

  it('should return the German translation of the date', () => {
    service.use('de');
    expect(pipe.transform('2019-10-18 12:00:00')).toBe('18.10.2019');
  });

  it('should return the Italian translation of the date', () => {
    service.use('it');
    expect(pipe.transform('2019-10-18 12:00:00')).toBe('18 ott 2019');
  });
});
