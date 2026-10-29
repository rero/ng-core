// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { MarkdownPipe } from './markdown.pipe';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        MarkdownPipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val,
          },
        },
      ],
    });
    pipe = TestBed.inject(MarkdownPipe);
  });

  it('should return markdown to html transformation', () => {
    expect(pipe.transform('# Heading level 1')).toContain('<h1>Heading level 1</h1>');
  });
});
