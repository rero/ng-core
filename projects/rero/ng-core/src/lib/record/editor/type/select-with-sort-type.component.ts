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
import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-editor-select-with-sort-type',
  template: `
    <select
      class="form-control"
      [formControl]="formControl"
      [formlyAttributes]="field"
    >
      <ng-container *ngFor="let item of to.options|sortByKeys:order">
        <option value="{{ item.value }}">{{ item.label }}</option>
      </ng-container>
    </select>
  `
})
export class SelectWithSortTypeComponent extends FieldType implements OnInit {
  /**
   * Menu order (Default order: label, desc ex: '-label')
   */
  public order = 'label';

  /** Init */
  ngOnInit() {
    const templateOptions = this.field.templateOptions;
    if ('selectWithSortOptions' in templateOptions) {
      if ('order' in templateOptions.selectWithSortOptions) {
        this.order = templateOptions.selectWithSortOptions.order;
      }
    }
  }
}
