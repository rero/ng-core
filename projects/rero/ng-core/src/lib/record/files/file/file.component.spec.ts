/*
 * RERO angular core
 * Copyright (C) 2023 RERO
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
import { TranslateModule } from '@ngx-translate/core';
import { RecordUiService } from '../../record-ui.service';
import { FileComponent } from './file.component';

const recordUiServiceSpy = jasmine.createSpyObj('RecordUiService', ['getResourceConfig']);
recordUiServiceSpy.getResourceConfig.and.returnValue({ key: 'documents', files: {} });
describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: RecordUiService, useValue: recordUiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    component.type = 'documents';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
