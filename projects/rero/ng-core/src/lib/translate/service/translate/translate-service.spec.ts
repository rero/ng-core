// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Settings } from 'luxon';
import { PrimeNG } from 'primeng/config';
import { NgCoreTranslateService } from './translate-service';

describe('NgCoreTranslateService', () => {
  let service: NgCoreTranslateService;
  let primeConfig: PrimeNG;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [NgCoreTranslateService, PrimeNG],
    });
    service = TestBed.inject(NgCoreTranslateService);
    primeConfig = TestBed.inject(PrimeNG);
  });

  it('should return the english translation (default)', () => {
    expect(primeConfig.translation.today).toEqual('Today');
  });

  it('should set luxon locale and primeng translation on use()', () => {
    service.use('en');
    expect(primeConfig.translation.today).toEqual('Today');
    expect(Settings.defaultLocale).toEqual('en');
  });

  it('should not throw when using a language not in locales', () => {
    expect(() => service.use('fr')).not.toThrow();
    expect(Settings.defaultLocale).toEqual('fr');
  });
});
