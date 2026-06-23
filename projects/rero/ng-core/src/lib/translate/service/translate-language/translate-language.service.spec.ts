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
  translateServiceSpy.getCurrentLang.mockReturnValue('en');

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

  it('should translate language code to english', () => {
    expect(service.translate('hat')).toBe('Haitian French Creole');
  });

  it('should fallback to english when language is not available', () => {
    expect(service.translate('hat', 'fr')).toBe('Haitian French Creole');
  });

  it('should return the code when langCode does not exist in any language', () => {
    expect(service.translate('xxx')).toBe('xxx');
  });

  it('should return the code when langCode does not exist and language is not available', () => {
    expect(service.translate('xxx', 'fr')).toBe('xxx');
  });
});
