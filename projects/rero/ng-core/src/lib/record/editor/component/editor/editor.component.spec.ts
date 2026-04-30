/*
 * RERO angular core
 * Copyright (C) 2020-2023 RERO
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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { FormlyModule } from '@ngx-formly/core';
import { RecordUiService } from '../../../service/record-ui/record-ui.service';
import { RecordService } from '../../../service/record/record.service';
import { EditorComponent } from './editor.component';
import { Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

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
});
