/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface ExtraTextAreaProps extends FormlyFieldProps {
  displayChars: boolean;
  displayWords: boolean;
  limitWords?: number;
  limitChars?: number;
}

@Component({
  selector: 'ng-core-editor-formly-field-textarea',
  template: `
    <textarea
      pInputTextarea
      [formControl]="formControl"
      [cols]="props.cols"
      [rows]="props.rows"
      class="form-control w-full"
      [class.is-invalid]="showError"
      [formlyAttributes]="field"
    ></textarea>
    @if (field.props.limitWords || field.props.displayWords) {
      <ng-container
        [ngTemplateOutlet]="counter"
        [ngTemplateOutletContext]="{
          limit: field.props.limitWords,
          count: countWords,
          label: 'Number of words' | translate
        }"></ng-container>
    }
    @if (field.props.limitChars || field.props.displayChars) {
      <ng-container
        [ngTemplateOutlet]="counter"
        [ngTemplateOutletContext]="{
          limit: field.props.limitChars,
          count: countChars,
          label: 'Number of chars' | translate
        }"></ng-container>
    }
    <ng-template #counter let-limit="limit" let-count="count" let-label="label">
      <span class="small text-muted d-inline-block mr-3">
        {{ label }}: {{ count }}
        @if (limit) {
          / {{ limit }}
        }
      </span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // means change detection is triggered only when @input changed.
})
export class TextareaFieldComponent extends FieldType<FormlyFieldConfig<ExtraTextAreaProps>> implements OnInit {
  /** Default properties */
  defaultOptions?: Partial<FormlyFieldConfig<ExtraTextAreaProps>> = {
    props: {
      displayChars: false,
      displayWords: false,
    }
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
    if (this.props.limitWords || this.props.limitChars) {
      this.formControl.setValidators([this.limitValidator(), this.formControl.validator]);
      this.formControl.updateValueAndValidity();
    }
  }

  /**
   * Form validator to check if the value is not greater than the limit.
   *
   * @returns A validator function returning the eventual error.
   */
  limitValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
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
