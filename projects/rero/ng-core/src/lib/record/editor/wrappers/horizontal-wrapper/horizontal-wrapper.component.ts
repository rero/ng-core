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
import { FormFieldWrapperComponent } from '../form-field-wrapper/form-field-wrapper.component';

@Component({
  selector: 'ng-core-horizontal-wrapper',
  template: `
    <div class="{{props.cssClass}} form-group m-0 d-flex align-items-center">
      <!-- label -->
      @if (props.label && props.hideLabel !== true) {
        <label [attr.for]="id" class="mr-2 col-form-label" [tooltip]="props.description">
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
            &nbsp;*
          }
        </label>
      }
      <!-- field -->
      <div class="flex-grow-1">
        <ng-template #fieldComponent></ng-template>
        @if (showError) {
          <div class="invalid-feedback d-block">
            <formly-validation-message [field]="field"></formly-validation-message>
          </div>
        }
      </div>
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
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalWrapperComponent extends FormFieldWrapperComponent { }
