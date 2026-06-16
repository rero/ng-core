// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { FormFieldWrapperComponent } from '../../wrappers/form-field-wrapper/form-field-wrapper.component';
import { IRemoteAutoCompleteProps, RemoteAutocompleteComponent } from './remote-autocomplete.component';
import { RemoteAutocompleteService } from './remote-autocomplete.service';

const ActivatedRouteSpy: any = {
  snapshot: {
    params: {
      id: 'pid',
    },
  },
};

const renderComponent = (field: FormlyFieldConfig<IRemoteAutoCompleteProps>) => {
  return createFieldComponent(field, {
    imports: [
      RemoteAutocompleteComponent,
      ReactiveFormsModule,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        wrappers: [{ name: 'form-field', component: FormFieldWrapperComponent }],
        types: [{ name: 'remote-autocomplete', component: RemoteAutocompleteComponent }],
      }),
      NoopAnimationsModule,
    ],
    providers: [RemoteAutocompleteService, { provide: ActivatedRoute, useValue: ActivatedRouteSpy }],
  });
};

describe('RemoteAutocomplete', () => {
  it('should should have the menu', () => {
    const { queryAll, field } = renderComponent({
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
              value: 'test',
            },
            {
              label: 'bar',
              value: 'bar',
            },
          ]),
        },
      },
    });

    expect(field.props?.queryOptions.filter).not.toBeNull();
    expect(queryAll('p-autoComplete')).toHaveLength(1);
  });
});
