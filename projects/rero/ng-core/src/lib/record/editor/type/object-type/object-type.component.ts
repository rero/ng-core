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
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

/**
 * Component for displaying an object in editor.
 */
@Component({
  selector: 'ng-core-editor-formly-object-type',
  templateUrl: './object-type.component.html'
})
export class ObjectTypeComponent extends FieldType<FormlyFieldConfig> {
  defaultOptions: Partial<FormlyFieldConfig<any>> = {
    props: {
      containerCssClass: 'flex flex-column gap-2'
    }
  };
}
