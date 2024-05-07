/*
 * RERO angular core
 * Copyright (C) 2021-2024 RERO
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

import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { createFieldComponent } from "@ngx-formly/core/testing";
import { MultiSelectComponent } from "./multi-select.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FormlyFormFieldModule } from "@ngx-formly/primeng/form-field";
import { MultiSelectModule } from "primeng/multiselect";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

const renderComponent = (field: FormlyFieldConfig) => {
  return createFieldComponent(field, {
    declarations: [MultiSelectComponent],
    imports: [
      NoopAnimationsModule,
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      TranslateModule.forRoot(),
      FormlyFormFieldModule,
      FormlyModule.forRoot({
        types: [{ name: 'multiSelect', component: MultiSelectComponent }]
      }),
      MultiSelectModule
    ],
    providers: [TranslateService]
  });
};

describe('ui-primeng: MultiSelect Type', () => {
  it('should render MultiSelect type', () => {
    const { query } = renderComponent({
      key: 'select',
      type: 'multiSelect'
    });

    expect(query('ng-core-multiselect')).not.toBeNull();
    expect(query('p-multiselect')).not.toBeNull();
  });
});
