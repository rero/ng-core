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
    <div class="form-group mt-2" [ngClass]="props.cssClass" [class.has-error]="showError">
      <!-- label -->
      @if (props.label && props.hideLabel !== true) {
        <label [attr.for]="id" [pTooltip]="props.description" tooltipPosition="top">
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
            &nbsp;*
          }
        </label>
      }
      <div class="flex align-content-center w-full mt-2">
        <div class="flex w-full align-items-center">
          <!-- field -->
          <ng-template #fieldComponent></ng-template>
        </div>
        <div class="flex align-items-center ml-1">
          <!-- clone button -->
          @if (canAdd()) {
            <p-button icon="fa fa-clone" severity="secondary" [text]="true" (onClick)="add()" styleClass="mr-1" />
          }
          <!-- trash button -->
          @if (canRemove() && props.hideLabel !== true) {
            <p-button icon="fa fa-trash" severity="secondary" [text]="true" (onClick)="remove()" styleClass="mr-1" />
          }
        </div>
      </div>
      @if (showError) {
        <div class="text-error mt-1">
          <formly-validation-message [field]="field"/>
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
