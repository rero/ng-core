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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-editor-dropdown-label-editor',
  templateUrl: './dropdown-label-editor.component.html'
})
export class DropdownLabelEditorComponent {
  // current form field configuration
  @Input()
  field: FormlyFieldConfig;

  // can we add a new element to the related array
  @Input()
  canAdd: boolean;

  // event when the add button is clicked
  @Output() addClicked = new EventEmitter<boolean>();

  /**
   * Emit a new Ouput event when the add button is clicked
   * @param event - Event, the click event.
   */
  addClick(event) {
    this.addClicked.emit(event);
  }
}
