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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ToastrModule } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { DialogComponent } from '../../dialog/dialog.component';
import { DialogService } from '../../dialog/dialog.service';
import { DefaultPipe } from '../../pipe/default.pipe';
import { Nl2brPipe } from '../../pipe/nl2br.pipe';
import { UpperCaseFirstPipe } from '../../pipe/ucfirst.pipe';
import { SearchInputComponent } from '../../search-input/search-input.component';
import { TranslateLanguagePipe } from '../../translate/translate-language.pipe';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { RecordSearchAggregationComponent } from './aggregation/aggregation.component';
import { RecordSearchComponent } from './record-search.component';
import { RecordSearchService } from './record-search.service';
import { RecordSearchResultComponent } from './result/record-search-result.component';

const adminMode = (): Observable<ActionStatus> => {
  return of({
    can: true,
    message: ''
  });
};


describe('RecordSearchComponent', () => {
  let component: RecordSearchComponent;
  let fixture: ComponentFixture<RecordSearchComponent>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'parseUrl']);
  routerSpy.parseUrl.and.returnValue({
    root: {
      children: {
        primary: {
          segments: [
            { path: 'admin' },
            { path: 'record' },
            { path: 'search' },
            { path: 'documents' }
          ]
        }
      }
    }
  });
  routerSpy.url = 'admin/record/search/documents';

  const emptyRecords = {
    aggregations: {},
    hits: {
      total: 2
    },
    links: {}
  };

  const recordServiceSpy = jasmine.createSpyObj('RecordService', ['getRecords', 'delete', 'totalHits']);
  recordServiceSpy.getRecords.and.returnValue(of(emptyRecords));
  recordServiceSpy.delete.and.returnValue(of({}));
  recordServiceSpy.totalHits.and.returnValue(10);

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
    },
    {
      key: 'organisations',
    }
  ];

  const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['show']);
  dialogServiceSpy.show.and.returnValue(of(true));

  const route = {
    snapshot: {
      data: {
        detailUrl: '/custom/url/for/detail/:type/:pid',
        types: [
          {
            key: 'documents',
          },
          {
            key: 'organisations',
          }
        ],
        showSearchInput: true,
        adminMode
      },
      queryParams: {
        q: '',
        page: 1,
        size: 10,
        sort: '',
        author: ['Filippini, Massimo']
      },
      paramMap: convertToParamMap({ type: 'documents' })
    },
    queryParams: of({})
  };

  const aggregations = {
    author: { buckets: []},
    language: { buckets: []}
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        SearchInputComponent,
        RecordSearchAggregationComponent,
        RecordSearchComponent,
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
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        PaginationModule.forRoot(),
        ModalModule.forRoot(),
        ToastrModule.forRoot()
      ],
      providers: [
        RecordSearchService,
        { provide: RecordService, useValue: recordServiceSpy },
        { provide: RecordUiService, useValue: recordUiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: route },
        { provide: DialogService, useValue: dialogServiceSpy },
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [DialogComponent],
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchComponent);
    component = fixture.componentInstance;
    component.aggregationsFilters = [];
    component.aggregations = [];
    /* tslint:disable:no-string-literal */
    component['_config'] = {
      preFilters: {}
    };
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change size', () => {
    expect(component.size).toBe(10);
    component.changeSize(new Event('click'), 50);
    expect(component.size).toBe(50);
  });

  it('should change query', () => {
    expect(component.q).toBe('');
    component.searchByQuery('search');
    expect(component.q).toBe('search');
  });

  it('should change type', () => {
    component.changeType(new Event('click'), 'organisations');
    expect(component.currentType).toBe('organisations');
    expect(component.aggregationsFilters.length).toBe(0);
  });

  it('should set current page for pagination', () => {
    component.currentPage = 2;
    expect(component.currentPage).toBe(2);
    expect(component.page).toBe(2);
  });

  it('should cancel deleting record process', () => {
    dialogServiceSpy.show.and.returnValue(of(false));

    component.types[0].total = 2;

    expect(component.types[0].total).toBe(2);
    component.deleteRecord('1');
    expect(component.types[0].total).toBe(2);
  });

  it('should delete record', fakeAsync(() => {
    dialogServiceSpy.show.and.returnValue(of(true));

    /* tslint:disable:no-string-literal */
    component['_config'].total = 2;

    expect(component['_config'].total).toBe(2);
    component.deleteRecord('1');
    tick(10000); // wait for refreshing records
    expect(component['_config'].total).toBe(1);
  }));

  it('should have permission to update record', () => {
    component.canUpdateRecord$({}).subscribe((result: any) => {
      expect(result.can).toBe(true);
    });

    recordUiServiceSpy.canUpdateRecord$.and.returnValue(of({ can: false, message: '' }));

    component.canUpdateRecord$({}).subscribe((result: any) => {
      expect(result.can).toBe(false);
    });
  });

  it('should have permission to delete record', () => {
    component.canDeleteRecord$({}).subscribe((result) => {
      expect(result.can).toBe(true);
    });

    recordUiServiceSpy.canDeleteRecord$.and.returnValue(of({ can: false, message: '' }));

    component.canDeleteRecord$({}).subscribe((result) => {
      expect(result.can).toBe(false);
    });
  });

  it('should resolve detail url', waitForAsync(() => {
    component.changeType(new Event('click'), 'documents');
    component['currentType'] = 'documents';
    component.detailUrl = '/custom/url/for/detail/:type/:pid';

    component.resolveDetailUrl$({ id: 100 }).subscribe((result: any) => {
      expect(result.link).toBe('/custom/url/for/detail/documents/100');
    });

    component.detailUrl = null;

    component.resolveDetailUrl$({ id: 100 }).subscribe((result: any) => {
      expect(result.link).toBe('detail/100');
    });
  }));
});
