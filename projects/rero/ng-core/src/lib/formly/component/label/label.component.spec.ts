/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

import { EditorComponent } from '../../../record/editor/component/editor/editor.component';
import { LabelComponent } from './label.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';


describe('LabelComponent', () => {
  let component: LabelComponent;
  let editorComponent: ComponentFixture<EditorComponent>;
  let fixture: ComponentFixture<LabelComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
    imports: [BrowserAnimationsModule,
        RouterModule.forRoot([]),

        TranslateModule.forRoot(), LabelComponent],
    providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        ConfirmationService,
        MessageService,
        DialogService
    ]
})
    
  });

  beforeEach(() => {
    editorComponent = TestBed.createComponent(EditorComponent);
    fixture = TestBed.createComponent(LabelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', { props: {editorComponent: () => editorComponent.componentInstance}});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
