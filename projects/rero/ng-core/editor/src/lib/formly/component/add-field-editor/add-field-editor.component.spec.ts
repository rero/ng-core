// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { provideTranslateService } from '@ngx-translate/core';
import { AutoCompleteSelectEvent } from '@openng/optimus-ui/autocomplete';

import { EditorComponent } from '../../../editor/component/editor/editor.component';
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
      imports: [AddFieldEditorComponent],
      providers: [provideTranslateService()],
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
