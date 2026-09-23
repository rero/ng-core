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

  it('should focus the autocomplete input when the field receives a focus event', async () => {
    const { field, query } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
    });
    const input = query<HTMLInputElement>('input').nativeElement;

    field.options?.fieldChanges?.next({ field, type: 'focus', value: true });

    await vi.waitFor(() => expect(document.activeElement).toBe(input));
  });

  it('should ignore focus events that do not target the field', () => {
    const { field, query } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
    });
    const input = query<HTMLInputElement>('input').nativeElement;
    const focusSpy = vi.spyOn(input, 'focus');

    field.options?.fieldChanges?.next({ field: {}, type: 'focus', value: true });
    field.options?.fieldChanges?.next({ field, type: 'valueChanges', value: true });
    field.options?.fieldChanges?.next({ field, type: 'focus', value: false });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should reset the field focus when the autocomplete loses focus', async () => {
    const { field, query } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
    });
    const input = query<HTMLInputElement>('input').nativeElement;

    input.focus();
    await vi.waitFor(() => expect(field.focus).toBe(true));

    input.blur();
    await vi.waitFor(() => expect(field.focus).toBe(false));
  });

  it('should not restore focus after the autocomplete loses focus', () => {
    const { field, query } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
    });
    const input = query<HTMLInputElement>('input').nativeElement;

    input.focus();
    input.blur();

    expect(field.focus).toBe(false);
    expect(document.activeElement).not.toBe(input);
  });

  it('should focus an autocomplete created after clearing an existing value', async () => {
    const { detectChanges, field, query } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
      model: { name: 'existing value' },
    });

    expect(query('input')).toBeNull();

    field.formControl?.reset(null);
    field.focus = true;
    detectChanges();

    await vi.waitFor(() => expect(document.activeElement).toBe(query<HTMLInputElement>('input').nativeElement));
  });

  it('should synchronize focus after recreating the autocomplete', async () => {
    const { detectChanges, field, query } = renderComponent({
      key: 'name',
      type: 'remote-autocomplete',
    });

    field.formControl?.setValue('selected value');
    detectChanges();
    expect(query('input')).toBeNull();

    field.formControl?.reset(null);
    field.focus = true;
    detectChanges();

    const input = query<HTMLInputElement>('input').nativeElement;
    await vi.waitFor(() => expect(document.activeElement).toBe(input));

    input.blur();
    await vi.waitFor(() => expect(field.focus).toBe(false));
  });
});
