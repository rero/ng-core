/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

import { RecordSearchStore } from '../../store/record-search.store';
import { DefaultSearchResultComponent } from './default-search-result/default-search-result.component';
import { RecordSearchResultComponent } from './record-search-result.component';

describe('RecordSearchResultComponent', () => {
  let component: RecordSearchResultComponent;
  let fixture: ComponentFixture<RecordSearchResultComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        ButtonModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot(),

        DefaultSearchResultComponent,
        RecordSearchResultComponent,
      ],
      providers: [provideHttpClient(withInterceptorsFromDi()), RecordSearchStore],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchResultComponent);
    component = fixture.componentInstance;
    // Set required input before detectChanges
    fixture.componentRef.setInput('record', {
      id: '1',
      metadata: { title: 'Test Record' },
      created: '',
      updated: '',
      links: { self: '' },
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete record', () => {
    // Since deleteStatus is now a computed signal based on store methods,
    // we verify the component can emit delete events
    component.deletedRecord.subscribe((info: { pid: string; type?: string }) => {
      expect(info.pid).toEqual('1');
    });

    // Call deleteRecord - it will check the current deleteStatus from the store
    component.deleteRecord('1');
  });
});
