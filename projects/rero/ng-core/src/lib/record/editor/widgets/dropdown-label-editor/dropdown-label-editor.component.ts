/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { Component, Input } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Component for displaying a label with dropdown in editor.
 */
@Component({
    selector: 'ng-core-editor-dropdown-label-editor',
    templateUrl: './dropdown-label-editor.component.html',
    standalone: false
})
export class DropdownLabelEditorComponent {
  // current form field configuration
  @Input() field: FormlyFieldConfig;

  // can we add a new element to the related array
  @Input() canAdd: boolean;
}
