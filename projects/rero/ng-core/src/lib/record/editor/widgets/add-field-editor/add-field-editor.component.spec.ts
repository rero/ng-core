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
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EditorComponent, RecordModule } from '@rero/ng-core';
import { AddFieldEditorComponent } from './add-field-editor.component';

describe('AddFieldEditorComponent', () => {
  let component: AddFieldEditorComponent;
  let editorComponent: ComponentFixture<EditorComponent>;
  let fixture: ComponentFixture<AddFieldEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        RecordModule,
        FormsModule,
        TranslateModule.forRoot()
      ],
      declarations: [AddFieldEditorComponent, EditorComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    editorComponent = TestBed.createComponent(EditorComponent);
    fixture = TestBed.createComponent(AddFieldEditorComponent);
    component = fixture.componentInstance;
    component.editorComponent = () => editorComponent.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
