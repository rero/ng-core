/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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

@Component({
  selector: 'ng-core-editor-formly-array-type',
  templateUrl: 'array-type.component.html'
})
export class ArrayTypeComponent extends FieldArrayType implements OnInit {
  /**
   * Are the children of type object?
   */
  isChildrenObject = false;

  /**
   * Component initialization
   */
  ngOnInit() {
    this.isChildrenObject = this.field.fieldArray.type === 'object';
  }

  /**
   * Is a new element can be added?
   * @returns boolean, true if a new element can be inserted in the array
   */
  canAdd(): boolean {
    const maxItems = this.field.templateOptions.maxItems;
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
    const minItems = this.field.templateOptions.minItems;
    if (minItems === undefined) {
      return true;
    }
    return this.field.fieldGroup.length > minItems;
  }

  /**
   * Add a new element in the array
   * @param i - number, the position to add the element
   */
  add(i: number, initialModel?: any) {
    // TODO: focus in the first input child
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

  /**
   * Hide the array and remove all the elements
   */
  hide() {
    for (const f of this.field.fieldGroup) {
      this.remove(0);
    }
    this.field.hide = true;
    this.field.formControl.reset();
  }

  /**
   * Is the dropdown menu displayed?
   * @param field - FormlyFieldConfig, the correspondig form field config
   * @returns boolean, true if the menu should be displayed
   */
  hasMenu(field: FormlyFieldConfig) {
    // TODO: add support for anyOf
    const f = field;
    // if (field.type === 'multischema') {
    //   f = f.fieldGroup[1];
    // }
    return (
      (f.type === 'object' && this.hiddenFieldGroup(f.fieldGroup).length > 0) ||
      f.templateOptions.helpURL
    );
  }

  /**
   * Filter the fieldGroup to return the list of hidden field.
   * @param fieldGroup - FormlyFieldConfig[], the fieldGroup to filter
   * @returns FormlyFieldConfig[], the filtered list
   */
  hiddenFieldGroup(fieldGroup: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fieldGroup.filter(f => f.hide && f.hideExpression == null);
  }
}