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
import { Component } from '@angular/core';
import JSONSchema from './schema.json';
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html'
})
export class EditorComponent {

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

  // form intial values
  model = {};

  /** Constructor */
  constructor() {
    this.schema = JSONSchema;
  }

  /** Callback when the model values has changed.
   * @param value - object the new model values
   */
  modelChanged(value: object) {
    this.model = value;
  }

}
