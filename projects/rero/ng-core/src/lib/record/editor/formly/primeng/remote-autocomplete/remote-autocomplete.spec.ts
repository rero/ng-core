/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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

import { ReactiveFormsModule } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute } from "@angular/router";
import { FormlyFieldConfig, FormlyModule } from "@ngx-formly/core";
import { createFieldComponent } from "@ngx-formly/core/testing";
import { FormFieldWrapperComponent } from "../../../wrappers/form-field-wrapper/form-field-wrapper.component";
import { IRemoteAutoCompleteProps, NgCoreFormlyRemoteAutocompleteModule, RemoteAutocomplete } from "./remote-autocomplete";
import { RemoteAutocompleteService } from "./remote-autocomplete.service";
import { TranslateModule } from "@ngx-translate/core";
import { of } from "rxjs";

const ActivatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['']);
ActivatedRouteSpy.snapshot = {
  params: {
    id: 'pid'
  }
}

const renderComponent = (field: FormlyFieldConfig<IRemoteAutoCompleteProps>) => {
  return createFieldComponent(field, {
    imports: [
      NgCoreFormlyRemoteAutocompleteModule,
      ReactiveFormsModule,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        wrappers: [
          { name: 'form-field', component: FormFieldWrapperComponent },
        ],
        types: [
          { name: 'remote-autocomplete', component: RemoteAutocomplete }
        ]
      }),
      NoopAnimationsModule,
    ],
    providers: [
      RemoteAutocompleteService,
      { provide: ActivatedRoute, useValue: ActivatedRouteSpy }
    ]
  });
};

describe('RemoteAutocomplete', () => {
  it('should should have the menu', () => {
    const { query, field } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
      props: {
        delay: 10,
        group: false,
        minLength: 10,
        scrollHeight: '350px',
        filters: {
          selected: 'test',
          options: of([
            {
              label: 'test',
              value: 'test'
            },
            {
              label: 'bar',
              value: 'bar'
            }
          ])
        }
      }
    });

    expect(field.props.queryOptions.filter).not.toBeNull();
    expect(query('p-autoComplete')).toHaveSize(1);
  });
});
