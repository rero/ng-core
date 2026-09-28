// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { Settings } from 'luxon';
import { Optimus } from '@openng/optimus-ui/config';
import { NgCoreTranslateService } from './translate-service';

describe('NgCoreTranslateService', () => {
  let service: NgCoreTranslateService;
  let primeConfig: Optimus;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgCoreTranslateService, Optimus, provideTranslateService()],
    });
    service = TestBed.inject(NgCoreTranslateService);
    primeConfig = TestBed.inject(Optimus);
  });

  it('should return the english translation (default)', () => {
    expect(primeConfig.translation.today).toEqual('Today');
  });

  it('should set luxon locale and optimus-ui translation on use()', () => {
    service.use('en');
    expect(primeConfig.translation.today).toEqual('Today');
    expect(Settings.defaultLocale).toEqual('en');
  });

  it('should not throw when using a language not in locales', () => {
    expect(() => service.use('fr')).not.toThrow();
    expect(Settings.defaultLocale).toEqual('fr');
  });
});
