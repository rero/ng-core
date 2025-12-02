/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

import { LoadTemplateFormComponent } from './load-template-form.component';

describe('LoadTemplateFormComponent', () => {
  let component: LoadTemplateFormComponent;
  let fixture: ComponentFixture<LoadTemplateFormComponent>;
  let dynamicDialogConfig: DynamicDialogConfig

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [
        BrowserAnimationsModule,

        ReactiveFormsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),
        LoadTemplateFormComponent
    ],
    providers: [
        TranslateService,
        DynamicDialogRef,
        MessageService,
        DynamicDialogConfig,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    
    dynamicDialogConfig = TestBed.inject(DynamicDialogConfig);
  });

  beforeEach(() => {
    dynamicDialogConfig.data = {
      resourceType: 'documents',
      templateResourceType: 'documents'
    }
    fixture = TestBed.createComponent(LoadTemplateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
