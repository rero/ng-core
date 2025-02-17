/*
 * RERO angular core
 * Copyright (C) 2021-2024 RERO
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
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Pipe to transform markdown to html.
 */
@Pipe({
    name: 'markdown',
    standalone: false
})
export class MarkdownPipe implements PipeTransform {

  protected sanitizer: DomSanitizer = inject(DomSanitizer);

  /**
   * Transform markdown to HTML.
   *
   * @param value Markdown initial value.
   * @returns HTML corresponding to markdown.
   */
  transform(value: string): SafeHtml {
    const markValue: string = marked.parse(value, { gfm: true, breaks: false, async: false });
    return this.sanitizer.bypassSecurityTrustHtml(markValue);
  }
}
