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
import {
  afterNextRender,
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy
} from '@angular/core';
import renderMathInElement, {
  RenderMathInElementOptions
} from 'katex/contrib/auto-render';

/**
 * KaTeX auto-render directive.
 *
 * This directive automatically renders LaTeX math expressions
 * inside the host element whenever:
 * - the directive inputs change (Signals)
 * - the DOM content of the element changes (innerHTML, *ngIf, async updates, etc.)
 *
 * It relies on:
 * - Angular Signals (`effect`)
 * - DOM MutationObserver (to track dynamic content)
 *
 * Docs:
 * https://katex.org/docs/autorender.html
 */
/* eslint-disable @angular-eslint/directive-selector */
@Directive({
  selector: '[katex]'
})
/* eslint-enable @angular-eslint/directive-selector */
export class KatexDirective implements OnDestroy {

  /**
   * Reference to the host DOM element.
   */
  private readonly el = inject(ElementRef<HTMLElement>);

  /**
   * Boolean attribute to enable/disable KaTeX rendering.
   *
   * Usage:
   *  <span katex></span>
   *  <span [katex]="true"></span>
   *  <span [katex]="false"></span>
   */
  readonly katex = input(false, { transform: booleanAttribute });

  /**
   * Optional KaTeX auto-render configuration.
   *
   * Example:
   *  [katexOptions]="{ delimiters: [...] }"
   */
  readonly katexOptions = input<RenderMathInElementOptions | undefined>(undefined);

  /**
   * MutationObserver used to detect changes
   * inside the host element (text, HTML, children).
   */
  private observer?: MutationObserver;

  constructor() {
    /**
     * React to Signal changes.
     *
     * This effect is triggered when:
     * - `katex` input changes
     * - `katexOptions` input changes
     *
     * The DOM mutations themselves are handled by the MutationObserver.
     */
    // Start observing DOM changes (only once)
    // only when the element is rendered.
    afterNextRender(() => {
      this.startObserving();
    });

    effect(() => {
      if (!this.katex()) {
        return;
      }
      // Initial render
      this.render();
    });
  }

  /**
   * Render KaTeX math expressions inside the host element.
   */
  private render(): void {
    renderMathInElement(
      this.el.nativeElement,
      this.katexOptions()
    );
  }

  /**
   * Start observing DOM mutations to re-render KaTeX
   * when the content of the element changes.
   */
  private startObserving(): void {
    // Avoid registering multiple observers
    if (this.observer) {
      return;
    }

    this.observer = new MutationObserver(() => {
      this.render();
    });

    this.observer.observe(this.el.nativeElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  /**
   * Clean up the MutationObserver to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
