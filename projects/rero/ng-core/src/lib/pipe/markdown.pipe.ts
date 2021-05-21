/*
 * RERO angular core
 * Copyright (C) 2021 RERO
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
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import marked from 'marked';
import { Nl2brPipe } from './nl2br.pipe';

/**
 * Pipe to transform markdown to html.
 */
@Pipe({
  name: 'markdown',
})
export class MarkdownPipe implements PipeTransform {
  /**
   * Constructor.
   *
   * @param _sanitizer Dom sanitizer.
   */
  constructor(private _sanitizer: DomSanitizer) {}

  /**
   * Transform markdown to HTML.
   *
   * @param value Markdown initial value.
   * @returns HTML corresponding to markdown.
   */
  transform(value: string): string {
    return new Nl2brPipe(this._sanitizer).transform(marked(value));
  }
}
