// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FieldArrayType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { LabelComponent } from '../../component/label/label.component';

/**
 * Component for displaying array fields in editor.
 */
@Component({
  selector: 'ng-core-editor-formly-array',
  templateUrl: 'array.component.html',
  imports: [LabelComponent, FormlyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArrayComponent extends FieldArrayType implements OnInit {
  /**
   * Component initialization
   */
  ngOnInit() {
    this.props.remove = this.remove.bind(this);
    this.props.add = this.add.bind(this);
    this.props.canAdd = this.canAdd.bind(this);
    this.props.canRemove = this.canRemove.bind(this);
    // props is a plain object mutation — emit fieldChanges so LabelComponent
    // re-evaluates canAddItem after these callbacks are set.
    this.field.options?.fieldChanges?.next({ field: this.field, type: 'hidden', value: false });
  }

  /**
   * Can a new element be added?
   * @returns boolean, true if a new element can be inserted in the array
   */
  canAdd(): boolean {
    if (!this.field.fieldGroup) {
      return false;
    }
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
    if (!this.field.fieldGroup) {
      return false;
    }
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
    if (this.field.fieldGroup == null) {
      return;
    }
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
