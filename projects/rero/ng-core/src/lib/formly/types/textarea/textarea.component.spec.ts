// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { createFieldComponent } from '@ngx-formly/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TextareaFieldComponent } from './textarea.component';

const renderComponent = (field: FormlyFieldConfig) =>
  createFieldComponent(field, {
    imports: [
      TextareaFieldComponent,
      TranslateModule.forRoot(),
      FormlyModule.forRoot({
        types: [{ name: 'textarea', component: TextareaFieldComponent }],
      }),
    ],
  });

describe('TextareaFieldComponent', () => {
  it('should configure an expandable textarea when singleLine is enabled', () => {
    const { query } = renderComponent({
      key: 'value',
      type: 'textarea',
      props: { singleLine: true },
    });
    const textarea = query('textarea');

    expect(textarea.attributes.rows).toBe('1');
    expect(textarea.classes['p-textarea-resizable']).toBe(true);
  });

  it('should prevent Enter when singleLine is enabled', () => {
    const { query } = renderComponent({
      key: 'value',
      type: 'textarea',
      props: { singleLine: true },
    });
    const textarea = query('textarea').nativeElement as HTMLTextAreaElement;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });

    textarea.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('should allow Enter during IME composition', () => {
    const { query } = renderComponent({
      key: 'value',
      type: 'textarea',
      props: { singleLine: true },
    });
    const textarea = query('textarea').nativeElement as HTMLTextAreaElement;
    const composingEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    textarea.dispatchEvent(composingEvent);

    expect(composingEvent.defaultPrevented).toBe(false);
  });

  it('should replace pasted line breaks when singleLine is enabled', () => {
    const { field, fixture, query } = renderComponent({
      key: 'value',
      type: 'textarea',
      props: { singleLine: true },
    });
    const textarea = query('textarea').nativeElement as HTMLTextAreaElement;

    textarea.value = 'First\r\nSecond\nThird';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(field.formControl?.value).toBe('First Second Third');
  });

  it('should normalize an initial value when singleLine is enabled', () => {
    const { field } = renderComponent({
      key: 'value',
      type: 'textarea',
      defaultValue: 'First\nSecond',
      props: { singleLine: true },
    });

    expect(field.formControl?.value).toBe('First Second');
  });

  it('should normalize subsequent form-control updates when singleLine is enabled', () => {
    const model = { value: '' };
    const { field } = renderComponent({
      key: 'value',
      type: 'textarea',
      model,
      props: { singleLine: true },
    });
    const values: string[] = [];
    field.formControl?.valueChanges.subscribe((value) => values.push(value));

    field.formControl?.setValue('First\r\nSecond');

    expect(field.formControl?.value).toBe('First Second');
    expect(values).toEqual(['First Second']);
    expect(model.value).toBe('First Second');
  });

  it('should preserve line breaks when singleLine is not enabled', () => {
    const { field, fixture, query } = renderComponent({
      key: 'value',
      type: 'textarea',
    });
    const textarea = query('textarea').nativeElement as HTMLTextAreaElement;

    textarea.value = 'First line\nSecond line';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(field.formControl?.value).toBe('First line\nSecond line');
  });
});
