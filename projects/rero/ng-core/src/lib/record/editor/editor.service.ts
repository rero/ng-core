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
import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditorService {
  // list of fields to be hidden
  private _hiddenFields: FormlyFieldConfig[] = [];

  // Observable of hidden fields
  private _hiddenFieldsSubject: BehaviorSubject<FormlyFieldConfig[]> = new BehaviorSubject([]);

  // current list of hidden fields
  get hiddenFields$(): Observable<any[]> {
    return this._hiddenFieldsSubject.asObservable();
  }

  /**
   * Set focus in the first field candidate
   */
  setFocus(field: FormlyFieldConfig, scroll: boolean = false) {

    if (field.fieldGroup && field.fieldGroup.length > 0) {
      return this.setFocus(field.fieldGroup[0], scroll);
    }
    // this.setFocus(f, scroll);
    field.focus = true;
    if (scroll === true) {
      const el = document.getElementById(field.id);
      el.scrollIntoView({ behavior: 'smooth' });
    }
    return true;
  }

  /**
   * Clear the list of the hidden fields
   */
  clearHiddenFields() {
    this._hiddenFields = [];
    this._hiddenFieldsSubject.next(this._hiddenFields);
  }

  /**
   * Check if the field is a candidate for the field navigation.
   * @param field - FormlyFieldConfig, form config to be added
   * @returns boolean, true if the field is at the root JSONSchema.
   */
  isFieldRoot(field: FormlyFieldConfig) {
    return field.parent.parent.parent === undefined;
  }

  /**
   * Add a field to the hidden list
   * @param field - FormlyFieldConfig, form config to be added
   */
  addHiddenField(field: FormlyFieldConfig) {
    if (!this._hiddenFields.some(f => f === field) && this.isFieldRoot(field)) {
      this._hiddenFields.push(field);
      this._hiddenFieldsSubject.next(this._hiddenFields);
    }
  }

  /**
   * Remove a field to the hidden list
   * @param field - FormlyFieldConfig, form config to be removed
   */
  removeHiddenField(field: FormlyFieldConfig) {
    if (this._hiddenFields.some(f => f === field) && this.isFieldRoot(field)) {
      this._hiddenFields = this._hiddenFields.filter(f => f.id !== field.id);
      this._hiddenFieldsSubject.next(this._hiddenFields);
    }
  }
}
