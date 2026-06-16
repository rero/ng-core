// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { EditorComponent } from '../../../record/editor/component/editor/editor.component';
import { LabelComponent } from './label.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
  selector: 'ng-core-formly-field-object',
  template: '',
  standalone: true,
})
class FormlyFieldObjectComponent extends FieldType {}

describe('LabelComponent', () => {
  let component: LabelComponent;
  let editorComponent: ComponentFixture<EditorComponent>;
  let fixture: ComponentFixture<LabelComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        FormlyModule.forRoot({
          types: [{ name: 'object', component: FormlyFieldObjectComponent }],
        }),
        LabelComponent,
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
        DialogService,
      ],
    });
  });

  beforeEach(() => {
    editorComponent = TestBed.createComponent(EditorComponent);
    fixture = TestBed.createComponent(LabelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', { props: { editorComponent: () => editorComponent.componentInstance } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
