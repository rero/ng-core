// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  afterNextRender,
  booleanAttribute,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import renderMathInElement, { RenderMathInElementOptions } from 'katex/contrib/auto-render';

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
  selector: '[katex]',
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
    renderMathInElement(this.el.nativeElement, this.katexOptions());
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
      characterData: true,
    });
  }

  /**
   * Clean up the MutationObserver to avoid memory leaks.
   */
  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
