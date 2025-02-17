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
import { Component, OnInit } from '@angular/core';
import { FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Component for displaying array fields in editor.
 */
@Component({
    selector: 'ng-core-editor-formly-array-type',
    templateUrl: 'array-type.component.html',
    standalone: false
})
export class ArrayTypeComponent extends FieldArrayType implements OnInit {

  /**
   * Component initialization
   */
  ngOnInit() {
    this.props.remove = this.remove.bind(this);
    this.props.add = this.add.bind(this);
    this.props.canAdd = this.canAdd.bind(this);
    this.props.canRemove = this.canRemove.bind(this);
  }

  /**
   * Can a new element be added?
   * @returns boolean, true if a new element can be inserted in the array
   */
  canAdd(): boolean {
    const { maxItems } = this.field.props;
    if (maxItems === undefined) {
      return true;
    }
    return this.field.fieldGroup.length < maxItems;
  }

  /**
   * Can an element be removed?
   * @returns boolean, true if an element ca be removed
   */
  canRemove() {
    const { minItems } = this.field.props;
    if (minItems === undefined) {
      return true;
    }
    return this.field.fieldGroup.length > minItems;
  }

  /**
   * Remove an element from the array and hide buttons
   * @param i - number, the position to remove the element
   */
  remove(i: number) {
    super.remove(i);
  }

  /**
   * Add a new element in the array
   * @param i - number, the position to add the element
   */
  add(i: number, initialModel?: any) {
    super.add(i, initialModel);
    this.setFocusInChildren(this.field.fieldGroup[i]);
  }

  /**
   * Set the focus to the first non object, array in children
   * Recursive.
   * @param field - FormlyFieldConfig, configuration form
   */
  setFocusInChildren(field: FormlyFieldConfig) {
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      for (const f of field.fieldGroup) {
        if (this.setFocusInChildren(f)) {
          return true;
        }
      }
      return false;
    }
    if (!field.hide) {
      field.focus = true;
      return true;
    }
    return false;
  }

}
