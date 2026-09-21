// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { FieldType, FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { RecordUiService } from '../../../service/record-ui/record-ui.service';
import { RecordService } from '../../../service/record/record.service';
import { EditorComponent } from './editor.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ng-core-formly-field-object',
  template: '',
  standalone: true,
})
class FormlyFieldObjectComponent extends FieldType {}

const recordUiServiceSpy: any = {
  getResourceConfig: vi.fn(),
  deleteRecord: vi.fn(),
  canReadRecord$: vi.fn(),
  canAddRecord$: vi.fn(),
  canUpdateRecord$: vi.fn(),
  canDeleteRecord$: vi.fn(),
};
recordUiServiceSpy.canReadRecord$.mockReturnValue(of({ can: true, message: '' }));
recordUiServiceSpy.canAddRecord$.mockReturnValue(of({ can: true, message: '' }));
recordUiServiceSpy.canUpdateRecord$.mockReturnValue(of({ can: true, message: '' }));
recordUiServiceSpy.canDeleteRecord$.mockReturnValue(of({ can: true, message: '' }));
recordUiServiceSpy.deleteRecord.mockReturnValue(of(true));
recordUiServiceSpy.getResourceConfig.mockReturnValue({ key: 'documents' });
recordUiServiceSpy.types = [
  {
    key: 'documents',
  },
];

const routeSpy: any = {};
routeSpy.params = of({ type: 'documents' });
routeSpy.queryParams = of({});
routeSpy.snapshot = {
  params: { type: 'documents' },
  data: {
    types: [
      {
        key: 'documents',
      },
    ],
    showSearchInput: true,
      adminMode: true,
  },
};

const recordService = {
  getSchemaForm: vi.fn(),
};
recordService.getSchemaForm.mockReturnValue(
  of({
    schema: {
      type: 'object',
      additionalProperties: true,
      properties: {},
    },
  }),
);

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        EditorComponent,
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        FormlyModule.forRoot({
          types: [{ name: 'object', component: FormlyFieldObjectComponent }],
        }),
      ],
      providers: [
        TranslateService,
        { provide: RecordService, useValue: recordService },
        { provide: RecordUiService, useValue: recordUiServiceSpy },
        { provide: ActivatedRoute, useValue: routeSpy },
        DialogService,
        MessageService,
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setFieldFocus', () => {
    it('should focus a scalar field', () => {
      const options: FormlyFormOptions = { fieldChanges: new Subject() };
      const focusChangeSpy = vi.spyOn(options.fieldChanges!, 'next');
      const field: FormlyFieldConfig = { type: 'input', options };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(field.focus).toBe(true);
      expect(focusChangeSpy).toHaveBeenCalledWith({ field, type: 'focus', value: true });
    });

    it('should focus the first input in a nested object', () => {
      const input: FormlyFieldConfig = { type: 'input' };
      const field: FormlyFieldConfig = {
        type: 'object',
        fieldGroup: [{ type: 'object', fieldGroup: [input] }],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(input.focus).toBe(true);
    });

    it('should focus the first input in an array item', () => {
      const input: FormlyFieldConfig = { type: 'input' };
      const field: FormlyFieldConfig = {
        type: 'array',
        fieldGroup: [{ type: 'object', fieldGroup: [input] }],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(input.focus).toBe(true);
    });

    it('should skip hidden fields', () => {
      const hiddenInput: FormlyFieldConfig = { type: 'input', hide: true };
      const visibleInput: FormlyFieldConfig = { type: 'input' };
      const field: FormlyFieldConfig = {
        type: 'object',
        fieldGroup: [hiddenInput, visibleInput],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(hiddenInput.focus).toBeUndefined();
      expect(visibleInput.focus).toBe(true);
    });

    it('should continue after an empty structural branch', () => {
      const emptyObject: FormlyFieldConfig = { type: 'object', fieldGroup: [] };
      const input: FormlyFieldConfig = { type: 'input' };
      const field: FormlyFieldConfig = {
        type: 'object',
        fieldGroup: [emptyObject, input],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(emptyObject.focus).toBeUndefined();
      expect(input.focus).toBe(true);
    });

    it('should skip selectors and focus the next input', () => {
      const select: FormlyFieldConfig = { type: 'select' };
      const multiSelect: FormlyFieldConfig = { type: 'multi-select' };
      const enumField: FormlyFieldConfig = { type: 'enum' };
      const input: FormlyFieldConfig = { type: 'input' };
      const field: FormlyFieldConfig = {
        type: 'object',
        fieldGroup: [select, multiSelect, enumField, input],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(select.focus).toBeUndefined();
      expect(multiSelect.focus).toBeUndefined();
      expect(enumField.focus).toBeUndefined();
      expect(input.focus).toBe(true);
    });

    it('should focus the first empty input', () => {
      const filledInput: FormlyFieldConfig = {
        type: 'input',
        formControl: new UntypedFormControl('first identifier'),
      };
      const emptyInput: FormlyFieldConfig = {
        type: 'input',
        formControl: new UntypedFormControl(''),
      };
      const field: FormlyFieldConfig = {
        type: 'array',
        fieldGroup: [
          { type: 'object', fieldGroup: [{ type: 'select' }, filledInput] },
          { type: 'object', fieldGroup: [{ type: 'select' }, emptyInput] },
        ],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(filledInput.focus).toBeUndefined();
      expect(emptyInput.focus).toBe(true);
    });

    it('should focus the first input when every input has a value', () => {
      const firstInput: FormlyFieldConfig = {
        type: 'input',
        formControl: new UntypedFormControl('first value'),
      };
      const secondInput: FormlyFieldConfig = {
        type: 'input',
        formControl: new UntypedFormControl('second value'),
      };
      const field: FormlyFieldConfig = {
        type: 'object',
        fieldGroup: [firstInput, secondInput],
      };

      expect(component.setFieldFocus(field)).toBe(true);
      expect(firstInput.focus).toBe(true);
      expect(secondInput.focus).toBeUndefined();
    });

    it('should return false when a structure only contains selectors', () => {
      const select: FormlyFieldConfig = { type: 'select' };
      const multiSelect: FormlyFieldConfig = { type: 'multi-select' };
      const field: FormlyFieldConfig = {
        type: 'object',
        fieldGroup: [select, multiSelect],
      };

      expect(component.setFieldFocus(field)).toBe(false);
      expect(select.focus).toBeUndefined();
      expect(multiSelect.focus).toBeUndefined();
    });

    it('should return false when a structure has no input', () => {
      const field: FormlyFieldConfig = { type: 'array', fieldGroup: [] };

      expect(component.setFieldFocus(field)).toBe(false);
      expect(field.focus).toBeUndefined();
    });
  });

  it('should show a field before searching for an input to focus', () => {
    const field: FormlyFieldConfig = { type: 'object', fieldGroup: [], hide: true };
    const focusSpy = vi.spyOn(component, 'setFieldFocus').mockImplementation((focusedField) => {
      expect(focusedField.hide).toBe(false);
      return false;
    });

    component.setHide(field, false);

    expect(field.hide).toBe(false);
    expect(focusSpy).toHaveBeenCalledWith(field, false);
  });
});
