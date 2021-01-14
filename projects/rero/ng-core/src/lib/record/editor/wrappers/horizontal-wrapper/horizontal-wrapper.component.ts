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
import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-horizontal-wrapper',
  template: `
    <div class="form-group m-0">
      <div class="d-flex">
        <label [attr.for]="id" class="text-nowrap mr-2 col-form-label" *ngIf="to.label && to.hideLabel !== true" [tooltip]="to.description" [ngClass]="to.labelClasses">
          {{ to.label }}
          <span *ngIf="to.required && to.hideRequiredMarker !== true">*</span>
        </label>
        <div class="flex-grow-1">
          <ng-template #fieldComponent></ng-template>
          <div *ngIf="showError" class="invalid-feedback d-block">
            <formly-validation-message [field]="field"></formly-validation-message>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HorizontalWrapperComponent extends FieldWrapper {

}
