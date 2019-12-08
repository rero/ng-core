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

import { EditorComponent } from './editor.component';
import { FormlyModule } from '@ngx-formly/core';
import { AddFieldEditorComponent } from './add-field-editor/add-field-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule, ModalModule } from 'ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';
import { RecordUiService } from '../record-ui.service';

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

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TypeaheadModule.forRoot(),
        ReactiveFormsModule,
        ModalModule.forRoot(),
        ToastrModule.forRoot(),
        TranslateModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        { provide: RecordUiService, useValue: recordUiServiceSpy },
        FormlyModule.forRoot()
      ],
      declarations: [ AddFieldEditorComponent, EditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: enable tests
  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
