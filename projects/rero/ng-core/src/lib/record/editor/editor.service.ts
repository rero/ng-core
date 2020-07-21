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

/**
 * Service for managing the editor.
 */
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
   * Scroll to a field or fieldGroup and set focus in the first field candidate.
   * @param field: the field or fieldGroup where to search about field candidate.
   * @param scroll: is the screen should scroll to the field.
   */
  setFocus(field: FormlyFieldConfig, scroll: boolean = false) {
    if (scroll === true && field.id)  {
      const el = document.getElementById(`field-${field.id}`);
      if (el != null) {
        // TODO : investigate why sometimes(often) the scroll isn't smooth...
        el.scrollIntoView({ behavior: 'smooth' });
        scroll = false;
      }
    }
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      const visibleFields = field.fieldGroup.filter(f => !f.hide);
      if (visibleFields.length > 0) {
        return this.setFocus(visibleFields[0], scroll);
      }
    }
    field.focus = true;
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
