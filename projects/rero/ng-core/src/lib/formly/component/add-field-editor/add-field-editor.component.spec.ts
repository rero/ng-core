// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { EditorComponent } from '../../../record';
import { AddFieldEditorComponent } from './add-field-editor.component';

describe('AddFieldEditorComponent', () => {
  let component: AddFieldEditorComponent;
  let fixture: ComponentFixture<AddFieldEditorComponent>;
  const editorComponent = {
    hiddenFields: vi.fn(() => []),
    setHide: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AddFieldEditorComponent, BrowserAnimationsModule, TranslateModule.forRoot()],
    });
    fixture = TestBed.createComponent(AddFieldEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('editorComponent', editorComponent as unknown as EditorComponent);
    fixture.detectChanges();
  });

  it('should add the selected field after the autocomplete closes', () => {
    const field: FormlyFieldConfig = { key: 'notes' };

    component.onSelect({ value: field } as AutoCompleteSelectEvent);

    expect(editorComponent.setHide).not.toHaveBeenCalled();

    component.onAutocompleteHide();

    expect(editorComponent.setHide).toHaveBeenCalledOnce();
    expect(editorComponent.setHide).toHaveBeenCalledWith(field, false, true);
  });
});
