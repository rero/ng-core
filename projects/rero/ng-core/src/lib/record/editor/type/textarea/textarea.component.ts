/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { FormlyFieldTextArea } from '@ngx-formly/bootstrap';

@Component({
  selector: 'ng-core-editor-formly-field-textarea',
  template: `
    <textarea
      [formControl]="formControl"
      [cols]="to.cols"
      [rows]="to.rows"
      class="form-control"
      [class.is-invalid]="showError"
      [formlyAttributes]="field"
    ></textarea>
    <ng-container
      [ngTemplateOutlet]="counter"
      [ngTemplateOutletContext]="{
        limit: field.templateOptions.limitWords,
        count: countWords,
        label: 'Number of words' | translate
      }"
      *ngIf="field.templateOptions.limitWords || field.templateOptions.displayWords"
    ></ng-container>
    <ng-container
      [ngTemplateOutlet]="counter"
      [ngTemplateOutletContext]="{
        limit: field.templateOptions.limitChars,
        count: countChars,
        label: 'Number of chars' | translate
      }"
      *ngIf="field.templateOptions.limitChars || field.templateOptions.displayChars"
    ></ng-container>
    <ng-template #counter let-limit="limit" let-count="count" let-label="label">
      <span class="small text-muted d-inline-block mr-3">
        {{ label }}: {{ count }}
        <ng-container *ngIf="limit"> / {{ limit }} </ng-container>
      </span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // means change detection is triggered only when @input changed.
})
export class TextareaFieldComponent extends FormlyFieldTextArea implements OnInit {
  /**
   * Get the number of chars.
   *
   * @returns The number of chars.
   */
  get countChars(): number {
    return !this.formControl.value ? 0 : this.formControl.value.length;
  }

  /**
   * Get the number of words.
   *
   * @returns The number of words.
   */
  get countWords(): number {
    return !this.formControl.value ? 0 : this.formControl.value.split(/\s+/).length;
  }

  /**
   * Component init.
   *
   * Adds validator for chars and words.
   * Check if the current value does not exceed the limit value for chars or words.
   */
  ngOnInit(): void {
    if (this.field.templateOptions.limitWords || this.field.templateOptions.limitChars) {
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
      if (this.field.templateOptions.limitWords && this.countWords > this.field.templateOptions.limitWords) {
        return { limitWords: { value: control.value } };
      }

      if (this.field.templateOptions.limitChars && this.countChars > this.field.templateOptions.limitChars) {
        return { limitChars: { value: control.value } };
      }

      return null;
    };
  }
}
