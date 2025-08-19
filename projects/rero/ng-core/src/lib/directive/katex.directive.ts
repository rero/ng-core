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
import { AfterContentChecked, Directive, ElementRef, inject, input } from '@angular/core';
import renderMathInElement, { RenderMathInElementOptions } from 'katex/contrib/auto-render';

// Doc: https://katex.org/docs/autorender

@Directive({
  selector: '[katex]',
  standalone: false
})
export class KatexDirective implements AfterContentChecked {

  private el = inject(ElementRef);

  katex = input<RenderMathInElementOptions>();

  ngAfterContentChecked(): void {
    renderMathInElement(this.el.nativeElement, this.katex());
  }
}
