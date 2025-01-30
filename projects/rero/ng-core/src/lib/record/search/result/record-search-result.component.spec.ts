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
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CoreModule } from '../../../core.module';
import { JsonComponent } from './item/json.component';
import { RecordSearchResultComponent } from './record-search-result.component';
import { ActionStatus } from '../../action-status';

describe('RecordSearchResultComponent', () => {
  let component: RecordSearchResultComponent;
  let fixture: ComponentFixture<RecordSearchResultComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        JsonComponent,
        RecordSearchResultComponent
      ],
      imports: [
        ButtonModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        HttpClientModule,
        CoreModule
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete record', () => {
    component.deleteStatus = { can: true, message: 'Delete record'};
    component.deletedRecord.subscribe(({
      next: (info: { pid: string, type?: string }) => expect(info.pid).toEqual('1')
    }));
    component.deleteRecord('1');

    component.deleteMessageEvent.subscribe((message: string) => expect(message).toEqual('Delete record'));
    component.deleteStatus.can = false;
    component.deleteRecord('1');
  });
});
