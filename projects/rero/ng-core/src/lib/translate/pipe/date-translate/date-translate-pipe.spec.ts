// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DateTranslatePipe } from './date-translate-pipe';
import { NgCoreTranslateService } from '../../service/translate/translate-service';

describe('DateTranslatePipePipe', () => {
  let pipe: DateTranslatePipe;
  let service: NgCoreTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [DateTranslatePipe],
    });
    service = TestBed.inject(NgCoreTranslateService);
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
