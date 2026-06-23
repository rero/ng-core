// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { de as primeDe } from 'primelocale/js/de.js';
import { fr as primeFr } from 'primelocale/js/fr.js';
import { it as primeIt } from 'primelocale/js/it.js';
import { CORE_LOCALES, Locales, NgCoreTranslateService } from '../../service/translate/translate-service';
import { DateTranslatePipe } from './date-translate-pipe';

class TestTranslateService extends NgCoreTranslateService {
  override locales: Locales = {
    ...CORE_LOCALES,
    de: { angular: localeDe, primeng: primeDe },
    fr: { angular: localeFr, primeng: primeFr },
    it: { angular: localeIt, primeng: primeIt },
  };
}

describe('DateTranslatePipePipe', () => {
  let pipe: DateTranslatePipe;
  let service: NgCoreTranslateService;

  beforeEach(() => {
    registerLocaleData(localeDe, 'de');
    registerLocaleData(localeFr, 'fr');
    registerLocaleData(localeIt, 'it');
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        DateTranslatePipe,
        { provide: NgCoreTranslateService, useClass: TestTranslateService },
      ],
    });
    service = TestBed.inject(NgCoreTranslateService);
    pipe = TestBed.inject(DateTranslatePipe);
    service.use('en');
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
