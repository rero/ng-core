// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { createFieldComponent } from '@ngx-formly/core/testing';
import { InputComponent, NgCoreFormlyInputFieldConfig } from './input.component';

import { FormlyModule } from '@ngx-formly/core';

const renderComponent = (field: NgCoreFormlyInputFieldConfig) => {
  return createFieldComponent(field, {
    imports: [
      InputComponent,
      FormlyModule.forRoot({
        types: [{ name: 'input', component: InputComponent }],
      }),
    ],
  });
};

describe('ui-primeng: NgCore Input Type', () => {
  it('should render input type with addon', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        addonLeft: ['Left'],
        addonRight: ['Right', 'RightBis'],
      },
    });
    expect(query('p-inputgroup')).not.toBeNull();
    const nodes = query('p-inputgroup').nativeElement.querySelectorAll('p-inputgroup-addon');
    expect(nodes[0].textContent).toBe('Left');
    expect(nodes[1].textContent).toBe('Right');
    expect(nodes[2].textContent).toBe('RightBis');
  });

  it('should not have the step attribute on a field that is not of type number', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
    });
    expect(query('input')).not.toBeNull();
    const { attributes } = query('input');
    expect(attributes.type).toEqual('text');
    expect(attributes.step).toBeUndefined();
  });

  it('should have the default step parameter set to number on a number field', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    expect(query('input')).not.toBeNull();
    const { attributes } = query('input');
    expect(attributes.type).toEqual('number');
    expect(attributes.step).toEqual('number');
  });

  it('should have the step parameter set to 0.5 on a number field', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        inputStep: 0.5,
      },
    });
    const { attributes } = query('input');
    expect(attributes.type).toEqual('number');
    expect(attributes.step).toEqual('0.5');
  });
});
