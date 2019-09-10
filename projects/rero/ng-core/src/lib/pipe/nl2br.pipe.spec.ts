import { SecurityContext } from '@angular/core';
import { DomSanitizer, BrowserModule, ɵDomSanitizerImpl } from '@angular/platform-browser';
import { inject, TestBed } from '@angular/core/testing';

import { Nl2brPipe } from './nl2br.pipe';

describe('Nl2brPipe', () => {
  let sanitizer: DomSanitizer = new ɵDomSanitizerImpl(null);

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          BrowserModule
        ]
      });
  });

  it('convert carriage return to <br> html tags', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    let pipe = new Nl2brPipe(domSanitizer);
    const safeText = pipe.transform('Text with\ncarriage return')
    const sanitizedValue = sanitizer.sanitize(SecurityContext.HTML, safeText);

    expect(sanitizedValue).toBe('Text with<br>\ncarriage return');
  }));

  it('should return empty string', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    let text: string;
    let pipe = new Nl2brPipe(domSanitizer);
    const safeText = pipe.transform(text)
    const sanitizedValue = sanitizer.sanitize(SecurityContext.HTML, safeText);

    expect(sanitizedValue).toBe('');
  }));
});