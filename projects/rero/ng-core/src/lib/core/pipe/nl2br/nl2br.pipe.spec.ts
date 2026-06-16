// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { Nl2brPipe } from './nl2br.pipe';

describe('Nl2brPipe', () => {
  let pipe: Nl2brPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrowserModule],
      providers: [Nl2brPipe, { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: (val: string) => val } }],
    });
    pipe = TestBed.inject(Nl2brPipe);
  });

  it('convert carriage return to <br> html tags', () => {
    const safeText = pipe.transform('Text with\ncarriage return');
    expect(safeText).toBe('Text with<br>\ncarriage return');
  });

  it('should return empty string', () => {
    const safeText = pipe.transform(null as any);
    expect(safeText).toBe('');
  });
});
