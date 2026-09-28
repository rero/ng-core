// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { de as primeDe } from '@openng/optimus-ui-locale/js/de.js';
import { fr as primeFr } from '@openng/optimus-ui-locale/js/fr.js';
import { it as primeIt } from '@openng/optimus-ui-locale/js/it.js';
import { CORE_LOCALES, Locales, NgCoreTranslateService } from '../../service/translate/translate-service';
import { DateTranslatePipe } from './date-translate-pipe';

class TestTranslateService extends NgCoreTranslateService {
  override locales: Locales = {
    ...CORE_LOCALES,
    de: { angular: localeDe, optimusUI: primeDe },
    fr: { angular: localeFr, optimusUI: primeFr },
    it: { angular: localeIt, optimusUI: primeIt },
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
      providers: [
        DateTranslatePipe,
        { provide: NgCoreTranslateService, useClass: TestTranslateService },
        provideTranslateService(),
        // Mirror the app's real wiring (core.provider.ts): TranslateService resolves
        // to the same NgCoreTranslateService instance, since DateTranslatePipe injects
        // the base TranslateService token directly. Must come after provideTranslateService()
        // so this overrides its own TranslateService provider.
        { provide: TranslateService, useExisting: NgCoreTranslateService },
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
