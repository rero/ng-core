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

  it('should have the default step and maxFractionDigits on a number field', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    expect(query('p-inputnumber')).not.toBeNull();
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.step()).toEqual(0.01);
    expect(inputNumber.maxFractionDigits).toEqual(2);
  });

  it('should have step and maxFractionDigits set from a custom step', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        step: 0.5,
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.step()).toEqual(0.5);
    expect(inputNumber.maxFractionDigits).toEqual(1);
  });

  it('should have no step and maxFractionDigits set to 20 when step is any', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        step: 'any' as any,
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.step()).toBeUndefined();
    expect(inputNumber.maxFractionDigits).toEqual(20);
  });

  it('should render p-inputnumber for a number field regardless of locale', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    expect(query('p-inputnumber')).not.toBeNull();
    expect(query('input[type="number"]')).toBeNull();
  });

  it('should show buttons by default on a number field', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.showButtons).toBe(true);
  });

  it('should hide buttons when showButtons is set to false', () => {
    const { query } = renderComponent({
      key: 'name',
      type: 'input',
      props: {
        type: 'number',
        showButtons: false,
      },
    });
    const inputNumber = query('p-inputnumber').componentInstance;
    expect(inputNumber.showButtons).toBe(false);
  });

});
