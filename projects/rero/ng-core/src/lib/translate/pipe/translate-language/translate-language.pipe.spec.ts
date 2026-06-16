// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { TranslateLanguagePipe } from './translate-language.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLanguageService } from '../../service/translate-language/translate-language.service';

class TranslateLanguageServiceMock {
  translate(langCode: string) {
    return langCode + '-translate';
  }
}

describe('TranslateLanguagePipe', () => {
  let pipe: TranslateLanguagePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [TranslateLanguagePipe, { provide: TranslateLanguageService, useClass: TranslateLanguageServiceMock }],
    });
    pipe = TestBed.inject(TranslateLanguagePipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform language code to human language', () => {
    expect(pipe.transform('fre')).toEqual('fre-translate');
  });
});
