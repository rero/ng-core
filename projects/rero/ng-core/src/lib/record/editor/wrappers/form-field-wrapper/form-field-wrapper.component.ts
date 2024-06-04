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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-form-field-wrapper',
  template: `
    <div class="{{props.cssClass}} form-group" [class.has-error]="showError">
      <!-- label -->
      @if (props.label && props.hideLabel !== true) {
        <label [attr.for]="id" [tooltip]="props.description">
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
            &nbsp;*
          }
        </label>
      }
      <!-- clone button -->
      @if (canAdd()) {
        <button type="button" (click)="add()" class="btn btn-link text-secondary btn-sm">
          <i class="fa fa-clone"></i>
        </button>
      }
      <!-- trash button -->
      @if (canRemove() && props.hideLabel !== true) {
        <button type="button" (click)="remove()" class="btn btn-link text-secondary btn-sm">
          <i class="fa fa-trash"></i>
        </button>
      }
      <!-- field -->
      <ng-template #fieldComponent></ng-template>
      @if (showError) {
        <div class="invalid-feedback d-block">
          <formly-validation-message [field]="field"></formly-validation-message>
        </div>
      }
   </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWrapperComponent extends FieldWrapper {

  /** Hide the field */
  remove(): void {
    switch (this.field.parent.type) {
      case 'object':
        this.field.props.setHide ? this.field.props.setHide(this.field, true): this.field.hide = true;
        break;
      case 'array':
        this.field.parent.props.remove(Number(this.field.key));
        break;
    }
  }

  /**
   * Is the field can be hidden?
   * @returns boolean, true if the field can be hidden
   */
  canRemove(): boolean {
    switch (this.field.parent.type) {
      case 'object':
        if (!this.field.props?.editorConfig?.longMode) {
          return false;
        }
        return (
          !this.field.props.required &&
          !this.field.hide
        );
        case 'array':
          return this.field.parent.props.canRemove();
        default:
          return false;
      }
  }

  /**
   * Is the field can be hidden?
   * @returns boolean, true if the field can be hidden
   */
  canAdd(): boolean {
    if (this.field.parent.type === 'array') {
      return this.field.parent.props.canAdd();
    }
    return false;
  }

  /** Add a new element */
  add(): void {
    if (this.field.parent.type === 'array') {
      const index = Number(this.field.key) + 1;
      this.field.parent.props.add(index);
    }
  }
}
