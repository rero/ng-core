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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, RouterModule, convertToParamMap } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DialogComponent } from '../../dialog/dialog.component';
import { DefaultPipe } from '../../pipe/default.pipe';
import { Nl2brPipe } from '../../pipe/nl2br.pipe';
import { UpperCaseFirstPipe } from '../../pipe/ucfirst.pipe';
import { SearchInputComponent } from '../../search-input/search-input.component';
import { TranslateLanguagePipe } from '../../translate/translate-language.pipe';
import { ActionStatus } from '../action-status';
import { RecordService } from '../record.service';
import { RecordSearchAggregationComponent } from './aggregation/aggregation.component';
import { RecordSearchPageComponent } from './record-search-page.component';
import { RecordSearchResultComponent } from './result/record-search-result.component';
import { ConfirmationService, MessageService } from 'primeng/api';

const adminMode = (): Observable<ActionStatus> => {
  return of({
    can: true,
    message: ''
  });
};

describe('RecordSearchPageComponent', () => {
  let component: RecordSearchPageComponent;
  let fixture: ComponentFixture<RecordSearchPageComponent>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  routerSpy.url = '';

  const emptyRecords = {
    aggregations: {},
    hits: {
      total: 2
    },
    links: {}
  };

  const recordServiceSpy = jasmine.createSpyObj('RecordService', ['getRecords', 'delete']);
  recordServiceSpy.getRecords.and.returnValue(of(emptyRecords));
  recordServiceSpy.delete.and.returnValue(of({}));

  const route = {
    snapshot: {
      data: {
        detailUrl: '/custom/url/for/detail/:type/:pid',
        types: [
          {
            key: 'documents'
          },
          {
            key: 'organisations'
          }
        ],
        showSearchInput: true,
        adminMode
      },
      params: { type: 'documents' }
    },
    queryParamMap: of(convertToParamMap({
      q: '',
      page: 1,
      size: 10,
      author: ['Filippini, Massimo'],
      sort: ''
    })),
    paramMap: of(convertToParamMap({ type: 'documents' })),
    queryParams: of({})
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SearchInputComponent,
        RecordSearchAggregationComponent,
        RecordSearchPageComponent,
        RecordSearchResultComponent,
        DefaultPipe,
        UpperCaseFirstPipe,
        Nl2brPipe,
        DialogComponent,
        TranslateLanguagePipe
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
      ],
      providers: [
        { provide: RecordService, useValue: recordServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: route },
        ConfirmationService,
        MessageService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
