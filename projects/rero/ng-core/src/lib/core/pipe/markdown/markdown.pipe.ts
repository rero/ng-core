// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Pipe to transform markdown to html.
 */
@Pipe({ name: 'markdown' })
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
