// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';

import { SaveTemplateFormComponent } from './save-template-form.component';

@Component({
  selector: 'ng-core-formly-field-string',
  template: '',
})
class FormlyFieldStringComponent extends FieldType {}

describe('SaveTemplateFormComponent', () => {
  let component: SaveTemplateFormComponent;
  let fixture: ComponentFixture<SaveTemplateFormComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        FormlyModule.forRoot({
          types: [{ name: 'string', component: FormlyFieldStringComponent }],
        }),
        SaveTemplateFormComponent,
      ],
      providers: [
        TranslateService,
        DynamicDialogRef,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
