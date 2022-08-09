/*
 * RERO angular core
 * Copyright (C) 2020-2022 RERO
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
import { FieldWrapper } from '@ngx-formly/core';
import { EditorComponent } from '../../editor.component';

@Component({
  selector: 'ng-core-form-field-wrapper',
  template: `
    <div class="{{to.cssClass}} form-group" [class.has-error]="showError">
      <!-- label -->
      <label [attr.for]="id" *ngIf="to.label && to.hideLabel !== true" [tooltip]="to.description">
        {{ to.label }}
        <ng-container *ngIf="to.required && to.hideRequiredMarker !== true">&nbsp;*</ng-container>
      </label>
      <!-- clone button -->
      <button type="button" *ngIf="canAdd()" (click)="add()" class="btn btn-link text-secondary btn-sm">
        <i class="fa fa-clone"></i>
      </button>
      <!-- trash button -->
      <button type="button" (click)="remove()" *ngIf="canRemove() && to.hideLabel !== true" class="btn btn-link text-secondary btn-sm">
        <i class="fa fa-trash"></i>
      </button>
      <!-- field -->
      <ng-template #fieldComponent></ng-template>
      <div *ngIf="showError" class="invalid-feedback d-block">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
   </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWrapperComponent extends FieldWrapper implements OnInit {

  private editorComponentInstance?: EditorComponent = null;

  ngOnInit(): void {
    if (this.field?.templateOptions?.editorComponent) {
      this.editorComponentInstance = (this.field.templateOptions.editorComponent)();
    }
  }

  /** Hide the field */
  remove(): void {
    switch (this.field.parent.type) {
      case 'object':
        if (this.editorComponentInstance) {
          this.editorComponentInstance.hide(this.field);
        }
        break;
      case 'array':
        this.field.parent.templateOptions.remove(Number(this.field.key));
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
        return this.editorComponentInstance ? this.editorComponentInstance.canHide(this.field) : false;
      case 'array':
        return this.field.parent.templateOptions.canRemove();
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
      return this.field.parent.templateOptions.canAdd();
    }
    return false;
  }

  /** Add a new element */
  add(): void {
    if (this.field.parent.type === 'array') {
      const index = Number(this.field.key) + 1;
      this.field.parent.templateOptions.add(index);
    }
  }
}
