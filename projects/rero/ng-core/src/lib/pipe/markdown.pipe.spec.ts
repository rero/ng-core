/*
 * RERO angular core
 * Copyright (C) 2025 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { TestBed } from "@angular/core/testing";
import { MarkdownPipe } from "./markdown.pipe";
import { DomSanitizer } from "@angular/platform-browser";

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
      ],
      providers: [
        MarkdownPipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val,
          }
        }
      ]
    })
    pipe = TestBed.inject(MarkdownPipe);
  });

  it('should return markdown to html transformation', () => {
    expect(pipe.transform('# Heading level 1')).toContain('<h1>Heading level 1</h1>')
  });
});
