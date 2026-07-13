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
import { FormControl, UntypedFormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { addNumberValidators } from './extensions';

const buildField = (type: 'number' | 'integer', props: Record<string, unknown> = {}): FormlyFieldConfig => {
  const control = new FormControl(null);
  const field: FormlyFieldConfig = { type, props, formControl: control };
  addNumberValidators(field);
  return field;
};

describe('addNumberValidators', () => {
  describe('step validator (default 0.01)', () => {
    it('should be valid when value has at most 2 decimal places', () => {
      const { formControl } = buildField('number');
      formControl!.setValue(2.55);
      expect(formControl!.errors).toBeNull();
    });

    it('should be invalid when value exceeds 2 decimal places', () => {
      const { formControl } = buildField('number');
      formControl!.setValue(2.553);
      expect(formControl!.errors).toEqual({ step: true });
    });

    it('should be valid for null value', () => {
      const { formControl } = buildField('number');
      formControl!.setValue(null);
      expect(formControl!.errors).toBeNull();
    });

    it('should not apply step validator when step is any', () => {
      const { formControl } = buildField('number', { step: 'any' });
      formControl!.setValue(2.55333333);
      expect(formControl!.errors).toBeNull();
    });
  });

  describe('step validator (explicit step 1.3)', () => {
    it('should be valid when value is a multiple of 1.3', () => {
      const { formControl } = buildField('number', { step: 1.3 });
      formControl!.setValue(2.6);
      expect(formControl!.errors).toBeNull();
    });

    it('should be invalid when value is not a multiple of 1.3', () => {
      const { formControl } = buildField('number', { step: 1.3 });
      formControl!.setValue(1.4);
      expect(formControl!.errors).toEqual({ step: true });
    });

    it('should be invalid when value has more decimals than step', () => {
      const { formControl } = buildField('number', { step: 1.3 });
      formControl!.setValue(1.35);
      expect(formControl!.errors).toEqual({ step: true });
    });
  });

  describe('step validator (explicit step 1)', () => {
    it('should be valid when value is an integer', () => {
      const { formControl } = buildField('number', { step: 1 });
      formControl!.setValue(10);
      expect(formControl!.errors).toBeNull();
    });

    it('should be invalid when value has decimals', () => {
      const { formControl } = buildField('number', { step: 1 });
      formControl!.setValue(10.5);
      expect(formControl!.errors).toEqual({ step: true });
    });
  });

  describe('min validator', () => {
    it('should be valid when value equals min', () => {
      const { formControl } = buildField('number', { min: 1 });
      formControl!.setValue(1);
      expect(formControl!.errors).toBeNull();
    });

    it('should be invalid when value is below min', () => {
      const { formControl } = buildField('number', { min: 1 });
      formControl!.setValue(0);
      expect(formControl!.errors).toEqual({ min: true });
    });
  });

  describe('max validator', () => {
    it('should be valid when value equals max', () => {
      const { formControl } = buildField('number', { max: 10 });
      formControl!.setValue(10);
      expect(formControl!.errors).toBeNull();
    });

    it('should be invalid when value exceeds max', () => {
      const { formControl } = buildField('number', { max: 10 });
      formControl!.setValue(11);
      expect(formControl!.errors).toEqual({ max: true });
    });
  });

  it('should do nothing for non-number fields', () => {
    const control = new UntypedFormControl(null);
    const field: FormlyFieldConfig = { type: 'string', props: {}, formControl: control };
    addNumberValidators(field);
    control.setValue('hello');
    expect(control.errors).toBeNull();
  });

  it('should do nothing when formControl is absent', () => {
    const field: FormlyFieldConfig = { type: 'number', props: { min: 1 } };
    expect(() => addNumberValidators(field)).not.toThrow();
  });
});
