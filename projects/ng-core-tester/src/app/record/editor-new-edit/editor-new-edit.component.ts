/*
* RERO angular core
* Copyright (C) 2022 RERO
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
import { AfterViewInit, Component } from '@angular/core';
import JSONSchema from './schema.json';

@Component({
  selector: 'app-editor-new',
  templateUrl: './editor-new-edit.component.html'
})
export class EditorNewEditComponent implements AfterViewInit {

  // editor settings
  editorSettings = {
    longMode: true,  // editor long mode
    template: {
      recordType: undefined,    // the resource considerate as template
      loadFromTemplate: false,  // enable load from template button
      saveAsTemplate: false     // allow to save the record as a template
    }
  };

  // JSONSchema
  schema = {};

  // form initial values
  model = {};

  // initial model on form
  initModel = {};

  pid = null;

  buttonNewOrEdit = 'New';

  newOrEditMode() {
    this.buttonNewOrEdit = (this.buttonNewOrEdit === 'New') ? 'Edit' : 'New';
    this.pid = (this.pid) ? null : '1';
    this.setModel();
  }

  setModel() {
    if (this.pid) {
      this.model =  {
        pid: this.pid,
        work_access_point: [
          {
            agent: {
              type: 'bf:Person',
              preferred_name: 'Verne, Jules',
              identifiedBy: [
                {
                  type: 'bf:Isbn',
                  value: '9780530190365',
                  note: 'Wentworth Press'
                }
              ]
            },
            title: 'The Tour of the World in 80 Days',
            part: [
              {
                partNumber: '2020',
                partName: 'Part name'
              }
            ]
          }
        ]
      };
    } else {
      this.model =  {};
    }
    this.initModel = this.model;
  }

  ngAfterViewInit(): void {
      this.schema = JSONSchema;
      // this.initModel = {...this.model};
      this.initModel = this.model;
  }

  /** Callback when the model values has changed.
   * @param value - object the new model values
   */
  modelChanged(value: object) {
    this.model = value;
  }
}
