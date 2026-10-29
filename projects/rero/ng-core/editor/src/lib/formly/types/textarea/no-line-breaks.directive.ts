// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { DestroyRef, Directive, inject, input, OnInit } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';

@Directive({
  selector: 'textarea[ngCoreNoLineBreak]',
  host: {
    '(keydown)': 'preventLineBreak($event)',
    '(input)': 'normalizeInput($event)',
  },
})
export class NoLineBreaksDirective implements OnInit {
  readonly enabled = input(false, { alias: 'ngCoreNoLineBreak' });

  private readonly destroyRef = inject(DestroyRef);
  private readonly ngControl = inject(NgControl, { self: true });

  ngOnInit(): void {
    if (!this.enabled()) {
      return;
    }

    const control = this.ngControl.control;
    if (control) {
      this.overrideSetValueWithNormalization(control);
      this.normalizeCurrentControlValue(control, control.value);
    }
  }

  preventLineBreak(event: KeyboardEvent): void {
    if (this.enabled() && event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
    }
  }

  /** Removes line breaks introduced by typing or pasting. */
  normalizeInput(event: Event): void {
    if (!this.enabled()) {
      return;
    }

    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const normalizedValue = this.normalizeValue(value);

    // Avoid rewriting the control or moving the cursor when the value has no line breaks.
    if (normalizedValue === value) {
      return;
    }

    // Recalculate the offsets because replacing line-break sequences can change the text length.
    const normalizedSelectionStart = this.normalizeValue(value.slice(0, selectionStart)).length;
    const normalizedSelectionEnd = this.normalizeValue(value.slice(0, selectionEnd)).length;
    const control = this.ngControl.control;

    if (control && control.value !== normalizedValue) {
      control.setValue(normalizedValue);
    }
    textarea.value = normalizedValue;
    textarea.setSelectionRange(normalizedSelectionStart, normalizedSelectionEnd);
  }

  /**
   * Overrides this control's setValue so programmatic updates are normalized
   * before Angular stores or emits them.
   */
  private overrideSetValueWithNormalization(control: AbstractControl): void {
    const originalSetValue = control.setValue;

    // Wrap setValue to normalize string values before Angular handles them.
    const normalizedSetValue: typeof control.setValue = (value, options) => {
      const normalizedValue = typeof value === 'string' ? this.normalizeValue(value) : value;

      // Calling control.setValue here would recurse. Call the saved method with its original context instead.
      originalSetValue.call(control, normalizedValue, options);
    };

    control.setValue = normalizedSetValue;
    this.destroyRef.onDestroy(() => {
      // Do not overwrite another replacement installed after this directive.
      if (control.setValue === normalizedSetValue) {
        control.setValue = originalSetValue;
      }
    });
  }

  private normalizeCurrentControlValue(control: AbstractControl, value: unknown): void {
    if (typeof value !== 'string') {
      return;
    }

    const normalizedValue = this.normalizeValue(value);
    if (normalizedValue !== value) {
      control.setValue(normalizedValue);
    }
  }

  /** Replaces a sequence of CR and LF characters with a single space. */
  private normalizeValue(value: string): string {
    return value.replace(/[\r\n]+/g, ' ');
  }
}
