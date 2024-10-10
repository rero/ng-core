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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { RecordModule } from '@rero/ng-core';
import { LoadTemplateFormComponent } from './load-template-form.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RouterModule } from '@angular/router';

describe('LoadTemplateFormComponent', () => {
  let component: LoadTemplateFormComponent;
  let fixture: ComponentFixture<LoadTemplateFormComponent>;
  let dynamicDialogConfig: DynamicDialogConfig

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LoadTemplateFormComponent],
      imports: [
        BrowserAnimationsModule,
        RecordModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
          TranslateService,
          DynamicDialogRef,
          DynamicDialogConfig
      ]
    })
    .compileComponents();
    dynamicDialogConfig = TestBed.inject(DynamicDialogConfig);
  }));

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
