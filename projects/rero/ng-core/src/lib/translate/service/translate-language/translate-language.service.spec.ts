// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TranslateLanguageService } from './translate-language.service';

describe('TranslateLanguageService', () => {
  const translateServiceSpy: any = {
    getCurrentLang: vi.fn(),
    onLangChange: of(null),
  };
  translateServiceSpy.getCurrentLang.mockReturnValue('fr');

  let service: TranslateLanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TranslateService, useValue: translateServiceSpy }],
    });

    service = TestBed.inject(TranslateLanguageService);
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
