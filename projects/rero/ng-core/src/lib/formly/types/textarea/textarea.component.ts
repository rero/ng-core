// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from 'primeng/textarea';

interface ExtraTextAreaProps extends FormlyFieldProps {
  displayChars: boolean;
  displayWords: boolean;
  limitWords?: number;
  limitChars?: number;
  singleLine: boolean;
}

@Component({
  selector: 'ng-core-editor-formly-field-textarea',
  template: `
    <textarea
      pTextarea
      [formControl]="formControl"
      [cols]="props.cols"
      [rows]="props.singleLine ? 1 : props.rows"
      [autoResize]="props.singleLine"
      class="core:w-full"
      [class.is-invalid]="showError"
      [formlyAttributes]="field"
      [ngClass]="{ 'ng-invalid ng-dirty': showError }"
      (keydown)="preventLineBreak($event)"
      (input)="normalizeInput($event)"
    ></textarea>
    @if (field.props.limitWords || field.props.displayWords) {
      <ng-container
        [ngTemplateOutlet]="counter"
        [ngTemplateOutletContext]="{
          limit: field.props.limitWords,
          count: countWords,
          label: 'Number of words' | translate,
        }"
      ></ng-container>
    }
    @if (field.props.limitChars || field.props.displayChars) {
      <ng-container
        [ngTemplateOutlet]="counter"
        [ngTemplateOutletContext]="{
          limit: field.props.limitChars,
          count: countChars,
          label: 'Number of chars' | translate,
        }"
      ></ng-container>
    }
    <ng-template #counter let-limit="limit" let-count="count" let-label="label">
      <span class="core:text-sm core:text-muted-color core:inline-block core:mr-4">
        {{ label }}: {{ count }}
        @if (limit) {
          / {{ limit }}
        }
      </span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, Textarea, ReactiveFormsModule, FormlyModule, NgClass, NgTemplateOutlet, TranslatePipe],
})
export class TextareaFieldComponent extends FieldType<FieldTypeConfig<ExtraTextAreaProps>> implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  /** Default properties */
  defaultOptions?: Partial<FieldTypeConfig<ExtraTextAreaProps>> = {
    props: {
      displayChars: false,
      displayWords: false,
      singleLine: false,
    },
  };

  /**
   * Get the number of chars.
   *
   * @returns The number of chars.
   */
  get countChars(): number {
    return this.formControl.value ? this.formControl.value.length : 0;
  }

  /**
   * Get the number of words.
   *
   * @returns The number of words.
   */
  get countWords(): number {
    return this.formControl.value ? this.formControl.value.split(/\s+/).length : 0;
  }

  /**
   * Component init.
   *
   * Adds validator for chars and words.
   * Check if the current value does not exceed the limit value for chars or words.
   */
  ngOnInit(): void {
    if (this.props.singleLine) {
      this.normalizeControlUpdates();
      this.setNormalizedValue(this.formControl.value);
    }

    if ((this.props.limitWords || this.props.limitChars) && this.formControl.validator) {
      this.formControl.setValidators([this.limitValidator(), this.formControl.validator]);
      this.formControl.updateValueAndValidity();
    }
  }

  /** Prevents explicit line breaks in an expandable single-line textarea. */
  preventLineBreak(event: KeyboardEvent): void {
    if (this.props.singleLine && event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
    }
  }

  /** Removes line breaks introduced by typing or pasting. */
  normalizeInput(event: Event): void {
    if (!this.props.singleLine) {
      return;
    }

    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const normalizedValue = this.normalizeValue(value);

    if (normalizedValue === value) {
      return;
    }

    const normalizedSelectionStart = this.normalizeValue(value.slice(0, selectionStart)).length;
    const normalizedSelectionEnd = this.normalizeValue(value.slice(0, selectionEnd)).length;

    if (this.formControl.value !== normalizedValue) {
      this.formControl.setValue(normalizedValue);
    }
    textarea.value = normalizedValue;
    textarea.setSelectionRange(normalizedSelectionStart, normalizedSelectionEnd);
  }

  /** Normalizes control updates before they are emitted to subscribers. */
  private normalizeControlUpdates(): void {
    const control = this.formControl;
    const setValue = control.setValue;
    const normalizedSetValue: typeof control.setValue = (value, options) =>
      setValue.call(control, typeof value === 'string' ? this.normalizeValue(value) : value, options);

    control.setValue = normalizedSetValue;
    this.destroyRef.onDestroy(() => {
      if (control.setValue === normalizedSetValue) {
        control.setValue = setValue;
      }
    });
  }

  /** Updates the form control only when line-break normalization changes its value. */
  private setNormalizedValue(value: unknown): void {
    if (typeof value !== 'string') {
      return;
    }

    const normalizedValue = this.normalizeValue(value);
    if (normalizedValue !== value) {
      this.formControl.setValue(normalizedValue);
    }
  }

  /** Replaces a sequence of CR and LF characters with a single space. */
  private normalizeValue(value: string): string {
    return value.replace(/[\r\n]+/g, ' ');
  }

  /**
   * Form validator to check if the value is not greater than the limit.
   *
   * @returns A validator function returning the eventual error.
   */
  limitValidator(): ValidatorFn {
    return (control: AbstractControl): Record<string, unknown> | null => {
      if (this.props.limitWords && this.countWords > this.props.limitWords) {
        return { limitWords: { value: control.value } };
      }

      if (this.props.limitChars && this.countChars > this.props.limitChars) {
        return { limitChars: { value: control.value } };
      }

      return null;
    };
  }
}
