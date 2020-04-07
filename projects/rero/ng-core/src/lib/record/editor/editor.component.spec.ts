/*
* Invenio angular core
* Copyright (C) 2019 RERO
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { RecordUiService } from '../record-ui.service';
import { RecordModule } from '../record.module';
import { RecordService } from '../record.service';
import { EditorComponent } from './editor.component';


const recordUiServiceSpy = jasmine.createSpyObj('RecordUiService', [
  'getResourceConfig',
  'deleteRecord',
  'canReadRecord$',
  'canAddRecord$',
  'canUpdateRecord$',
  'canDeleteRecord$'
]);
recordUiServiceSpy.canReadRecord$.and.returnValue(of({ can: true, message: '' }));
recordUiServiceSpy.canAddRecord$.and.returnValue(of({ can: true, message: '' }));
recordUiServiceSpy.canUpdateRecord$.and.returnValue(of({ can: true, message: '' }));
recordUiServiceSpy.canDeleteRecord$.and.returnValue(of({ can: true, message: '' }));
recordUiServiceSpy.deleteRecord.and.returnValue(of(true));
recordUiServiceSpy.getResourceConfig.and.returnValue({ key: 'documents' });
recordUiServiceSpy.types = [
  {
    key: 'documents',
  }
];

const route = {
  params: of({ type: 'documents' }),
  snapshot: {
    params: { type: 'documents' },
    data: {
      types: [
        {
          key: 'documents',
        }
      ],
      showSearchInput: true,
      adminMode: true
    }
  },
  queryParams: of({})
};

const recordService = jasmine.createSpyObj('RecordService', ['getSchemaForm']);
recordService.getSchemaForm.and.returnValue(of({
  schema: {
    type: 'object',
    additionalProperties: true,
    properties: {}
  }
}));

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RecordModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        TranslateService,
        { provide: RecordService, useValue: recordService },
        { provide: RecordUiService, useValue: recordUiServiceSpy },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
