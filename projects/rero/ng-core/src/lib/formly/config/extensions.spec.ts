// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { TestBed } from '@angular/core/testing';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { RecordService } from '../../record/service/record/record.service';
import { addNumberValidators, NgCoreFormlyExtension } from './extensions';

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

describe('NgCoreFormlyExtension.prePopulate', () => {
  let extension: NgCoreFormlyExtension;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: RecordService, useValue: {} }],
    });
    extension = TestBed.runInInjectionContext(() => new NgCoreFormlyExtension());
  });

  it('should default step to 1 for integer fields when not configured', () => {
    const field: FormlyFieldConfig = { type: 'integer' };
    extension.prePopulate(field);
    expect(field.props?.step).toBe(1);
  });

  it('should not override an explicitly configured step for integer fields', () => {
    const field: FormlyFieldConfig = { type: 'integer', props: { step: 5 } };
    extension.prePopulate(field);
    expect(field.props?.step).toBe(5);
  });

  it('should not set a default step for non-integer fields', () => {
    const field: FormlyFieldConfig = { type: 'number' };
    extension.prePopulate(field);
    expect(field.props?.step).toBeUndefined();
  });
});
