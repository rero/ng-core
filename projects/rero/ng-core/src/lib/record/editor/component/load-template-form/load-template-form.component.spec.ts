// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import { MessageService } from '@openng/optimus-ui/api';

import { LoadTemplateFormComponent } from './load-template-form.component';

describe('LoadTemplateFormComponent', () => {
  let component: LoadTemplateFormComponent;
  let fixture: ComponentFixture<LoadTemplateFormComponent>;
  let dynamicDialogConfig: DynamicDialogConfig;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, ReactiveFormsModule, RouterModule.forRoot([]), LoadTemplateFormComponent],
      providers: [
        TranslateService,
        DynamicDialogRef,
        MessageService,
        DynamicDialogConfig,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideTranslateService(),
      ],
    });

    dynamicDialogConfig = TestBed.inject(DynamicDialogConfig);
  });

  beforeEach(() => {
    dynamicDialogConfig.data = {
      resourceType: 'documents',
      templateResourceType: 'documents',
    };
    fixture = TestBed.createComponent(LoadTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
