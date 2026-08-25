// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { CheckboxComponent } from './checkbox.component';

const renderComponent = (field: FormlyFieldConfig) => {
  return createFieldComponent(field, {
    imports: [
      CheckboxComponent,
      FormlyModule.forRoot({
        types: [{ name: 'checkbox', component: CheckboxComponent }],
      }),
    ],
  });
};

describe('CheckboxComponent', () => {
  it('should display a checkbox with its label', () => {
    const { query } = renderComponent({
      key: 'accepted',
      type: 'checkbox',
      props: { label: 'Accept' },
    });
    expect(query('p-checkbox')).not.toBeNull();
    expect(query('label').nativeElement.textContent).toContain('Accept');
  });

  it('should update the model when checked', () => {
    const { query, field, fixture } = renderComponent({
      key: 'accepted',
      type: 'checkbox',
      props: { label: 'Accept' },
    });
    (query('input[type="checkbox"]').nativeElement as HTMLInputElement).click();
    fixture.detectChanges();
    expect(field.formControl?.value).toBe(true);
  });
});
