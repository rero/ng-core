import { BrowserModule } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

import { TranslateLanguagePipe } from '../translate-language/translate-language.pipe';

describe('TranslateLanguagePipe', () => {
  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          BrowserModule
        ]
      });
  });

  it('should return lang text', () => {
    const langText = 'French';

    const translateLanguageServiceSpy = jasmine.createSpyObj('TranslateLanguageService', ['translate']);
    translateLanguageServiceSpy.translate.and.returnValue(langText);

    const pipe = new TranslateLanguagePipe(translateLanguageServiceSpy);

    expect(pipe.transform('fr', 'en')).toBe(langText);
  });
});
