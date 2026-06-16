// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldWrapper, FormlyModule } from '@ngx-formly/core';
import { Tooltip } from 'primeng/tooltip';
import { Button } from 'primeng/button';

@Component({
  selector: 'ng-core-form-field-wrapper',
  template: `
    <div class="core:flex core:flex-col core:gap-2" [class]="props.cssClass" [class.has-error]="showError">
      <!-- label -->
      @if (props.label && props.hideLabel !== true) {
        <div>
          <label [attr.for]="id" [pTooltip]="props.description" tooltipPosition="top">
            {{ props.label }}
            @if (props.required && props.hideRequiredMarker !== true) {
              &nbsp;*
            }
          </label>
        </div>
      }
      <div class="core:flex core:content-center core:grow core:gap-1">
        <div class="core:grow">
          <!-- field -->
          <ng-template #fieldComponent></ng-template>
        </div>
        @if (canAdd() || canRemove()) {
          <div class="core:flex core:gap-1 core:items-center">
            <!-- clone button -->
            @if (canAdd()) {
              <p-button icon="fa fa-clone" severity="secondary" [text]="true" (onClick)="add()" />
            }
            <!-- trash button -->
            @if (canRemove()) {
              <p-button icon="fa fa-trash" severity="secondary" [text]="true" (onClick)="remove()" />
            }
          </div>
        }
      </div>
      @if (showError) {
        <div class="text-error core:my-2">
          <formly-validation-message [field]="field" />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Tooltip, Button, FormlyModule],
})
export class FormFieldWrapperComponent extends FieldWrapper {
  /** Hide the field */
  remove(): void {
    switch (this.field.parent?.type) {
      case 'object':
        if (this.field.props?.setHide) {
          this.field.props.setHide(this.field, true);
        } else {
          this.field.hide = true;
        }
        break;
      case 'array':
        this.field.parent.props?.remove(Number(this.field.key));
        break;
    }
  }

  /**
   * Is the field can be hidden?
   * @returns boolean, true if the field can be hidden
   */
  canRemove(): boolean {
    switch (this.field.parent?.type) {
      case 'object':
        if (!this.field.props?.editorConfig?.longMode) {
          return false;
        }
        return !this.field.props.required && !this.field.hide;
      case 'array':
        return this.field.parent.props?.canRemove();
      default:
        return false;
    }
  }

  /**
   * Is the field can be hidden?
   * @returns boolean, true if the field can be hidden
   */
  canAdd(): boolean {
    if (this.field.parent?.type === 'array') {
      return this.field?.parent.props?.canAdd();
    }
    return false;
  }

  /** Add a new element */
  add(): void {
    if (this.field.parent?.type === 'array') {
      const index = Number(this.field.key) + 1;
      this.field.parent.props?.add(index);
    }
  }
}
