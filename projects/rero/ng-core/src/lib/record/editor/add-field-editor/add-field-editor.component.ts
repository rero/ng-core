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

import { Component, Input, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/public_api';
import { EditorService } from '../editor.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Type a head selection type
 */
interface FormlyFieldConfigSelection {
  name: string;
  field: FormlyFieldConfig;
}

/**
 * For big editor add the possiblity to display
 */
@Component({
  selector: 'ng-core-editor-add-field-editor',
  templateUrl: './add-field-editor.component.html'
})
export class AddFieldEditorComponent implements OnInit {
  // current input value
  value: string;

  // current list of object for autocomplete
  typeaheadFields$: Observable<Array<FormlyFieldConfigSelection>>;

  // list of fields to populate autocomplete
  @Input()
  fields: FormlyFieldConfig[];

  /***
   * Constructor
   * @param editorService - EditorService, that keep the list of hidden fields
   */
  constructor(
    private editorService: EditorService
  ) {}

  /***
   * Component init
   */
  ngOnInit() {
    // avoid duplicate when switching between page
    this.editorService.clearHiddenFields();
    this.typeaheadFields$ = this.editorService.hiddenFields$.pipe(
      map( (fields: FormlyFieldConfig[]) => {
        const value = fields.map(field => {
          return {name: field.templateOptions.label, field};
        });
        return value;
      })
    );
  }


  /***
   * Shows the selected field when it is selected
   * @param match - TypeaheadMatch, the selected element
   */
  itemSelected(match: TypeaheadMatch) {
    this.showSelectedField(match.item.field);
  }

  /***
   * Shows the selected field when it is selected
   * @param match - TyepeaheadMath, the selected element
   */
  showSelectedField(field) {
    // show the field in the form
    field.hide = false;

    // TODO: remove this workaround when the following issue will be solved
    // https://github.com/ngx-formly/ngx-formly/issues/198
    field.formControl.enable();

    // reset the input value
    this.value = undefined;
    // remove the the element from the list of hidden fields
    this.editorService.removeHiddenField(field);
    // scroll at the right position
    // to avoid: Expression has changed after it was checked
    // See: https://blog.angular-university.io/angular-debugging/
    // wait that the component is present in the DOM
    setTimeout(() => this.editorService.setFocus(field, true));
  }

  /**
   * Get all essential fields to add as nav shortcut.
   * @returns - FormlyFieldConfigSelection[], the filtered selection values
   */
  getEssentials(): Observable<FormlyFieldConfigSelection[]> {
    return this.typeaheadFields$.pipe(
      map((fields: FormlyFieldConfigSelection[]) => fields.filter(
        f =>
          f.field.templateOptions.navigation &&
          f.field.templateOptions.navigation.essential === true
      ))
    );
  }
}
