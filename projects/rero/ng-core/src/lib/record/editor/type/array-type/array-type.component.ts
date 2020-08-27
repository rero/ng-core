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
import { FieldArrayType, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Component for displaying array fields in editor.
 */
@Component({
  selector: 'ng-core-editor-formly-array-type',
  templateUrl: 'array-type.component.html'
})
export class ArrayTypeComponent extends FieldArrayType implements OnInit {
  /** True if children are of type object */
  isChildrenObject = false;

  /** True if the children are of type array */
  isChildrenArray = false;

  /** Constructor
   *
   * @param _translateService - TranslateService, that translate the labels of the hidden fields
   */
  constructor(private _translateService: TranslateService) {
    super();
  }

  /**
   * Component initialization
   */
  ngOnInit() {
    this.isChildrenObject = this.field.fieldArray.type === 'object';
    this.isChildrenArray = this.field.fieldArray.type === 'array';

    // reset the number of elements in the array when the array is hidden
    this.field.options.fieldChanges.subscribe(changes => {
      const minItems = this.field.templateOptions.minItems ? this.field.templateOptions.minItems : 0;
      if (
        // hide property has changed
        changes.type === 'hidden'
        // transition from visible to hide
        && (changes.value === true)
        // the changes concern the current field
        && (this.field.id === changes.field.id)
      ) {
        // number of elements to remove
        const numberOfItemsToRemove = this.field.fieldGroup.length - minItems;
        // remove the extra elements
        for (let i = 0; i < numberOfItemsToRemove; i++) {
          this.remove(0);
        }
      }
    });
  }

  /**
   * Can a new element be added?
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
   * Translate the label of a given formly field.
   *
   * @param field ngx-formly field
   */
  translateLabel(field: FormlyFieldConfig) {
    return this._translateService.stream(field.templateOptions.untranslatedLabel);
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
