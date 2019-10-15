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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { RecordSearchComponent } from './record-search.component';
import { DefaultPipe } from '../../pipe/default.pipe';
import { UpperCaseFirstPipe } from '../../pipe/ucfirst.pipe';
import { SearchInputComponent } from '../../search-input/search-input.component';
import { RecordSearchAggregationComponent } from './aggregation/aggregation.component';
import { RecordSearchResultComponent } from './result/record-search-result.component';
import { RecordService } from '../record.service';
import { DialogComponent } from '../../dialog/dialog.component';
import { Nl2brPipe } from '../../pipe/nl2br.pipe';
import { DialogService } from '../../dialog/dialog.service';

describe('RecordSearchComponent', () => {
  let component: RecordSearchComponent;
  let fixture: ComponentFixture<RecordSearchComponent>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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

  const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['show']);
  dialogServiceSpy.show.and.returnValue(of(true));

  const route = {
    snapshot: {
      data: {
        linkPrefix: '/records',
        detailUrl: '/custom/url/for/detail',
        types: [
          {
            key: 'documents',
          },
          {
            key: 'institutions',
          }
        ],
        showSearchInput: true,
        adminMode: true
      },
      queryParams: {
        q: '',
        page: 1,
        size: 10,
        author: ['Filippini, Massimo']
      },
      paramMap: convertToParamMap({ type: 'documents' })
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SearchInputComponent,
        RecordSearchAggregationComponent,
        RecordSearchComponent,
        RecordSearchResultComponent,
        DefaultPipe,
        UpperCaseFirstPipe,
        Nl2brPipe,
        DialogComponent
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
        { provide: RecordService, useValue: recordServiceSpy },
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update aggregation filters', () => {
    component.aggFilters = [];
    // add one filter
    expect(component.aggFilters.length).toBe(0);
    component.updateAggregationFilter({ term: 'author', values: ['Filippini, Massimo'] });
    expect(component.aggFilters.length).toBe(1);

    // add several filters
    component.updateAggregationFilter({ term: 'author', values: ['Filippini, Massimo', 'Botturi, Luca'] });
    const index = component.aggFilters.findIndex(item => item.key === 'author');
    expect(index).toEqual(0);
    expect(component.aggFilters[index].values.length).toBe(2);
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
    expect(component.currentType).toBe('documents');
    component.changeType(new Event('click'), 'institutions');
    expect(component.currentType).toBe('institutions');
    expect(component.aggFilters.length).toBe(0);
  });

  it('should return selected values for current filter', () => {
    component.aggFilters = [];
    let selectedValues = component.getFilterSelectedValues('author');
    expect(selectedValues.length).toBe(0);

    component.aggFilters.push({ key: 'author', values: ['Filippini, Massimo'] });
    selectedValues = component.getFilterSelectedValues('author');
    expect(selectedValues.length).toBe(1);
    expect(selectedValues[0]).toBe('Filippini, Massimo');
  });

  it('should set current page for pagination', () => {
    component.currentPage = 2;
    expect(component.currentPage).toBe(2);
    expect(component.page).toBe(2);
  });

  it('should cancel deleting record process', () => {
    dialogServiceSpy.show.and.returnValue(of(false));

    expect(component.types[0].total).toBe(2);
    component.deleteRecord('1');
    expect(component.types[0].total).toBe(2);
  });

  it('should delete record', fakeAsync(() => {
    dialogServiceSpy.show.and.returnValue(of(true));

    expect(component.types[0].total).toBe(2);
    component.deleteRecord('1');
    tick(10000); // wait for refreshing records
    expect(component.types[0].total).toBe(1);
  }));

  it('should have permission to add record', () => {
    expect(component.canAddRecord()).toBe(true);

    component.types = [
      {
        key: 'documents',
        label: 'Documents',
        canAdd: () => false
      }
    ];
    /* tslint:disable:no-string-literal */
    component['loadResourceConfig']();

    expect(component.canAddRecord()).toBe(false);
  });

  it('should have permission to update record', () => {
    expect(component.canUpdateRecord({})).toBe(true);

    component.types = [
      {
        key: 'documents',
        label: 'Documents',
        canUpdate: () => false
      }
    ];
    /* tslint:disable:no-string-literal */
    component['loadResourceConfig']();

    expect(component.canUpdateRecord({})).toBe(false);
  });

  it('should have permission to delete record', () => {
    component.canDeleteRecord({}).subscribe((result) => {
      expect(result.can).toBe(true);
    });

    component.types = [
      {
        key: 'documents',
        label: 'Documents',
        canDelete: () => of({ can: false, message: '' })
      }
    ];
    /* tslint:disable:no-string-literal */
    component['loadResourceConfig']();

    component.canDeleteRecord({}).subscribe((result) => {
      expect(result.can).toBe(false);
    });
  });

  it('should raise exception when configuration not found for type', () => {
    component.types = [];
    expect(() => {
      /* tslint:disable:no-string-literal */
      component['loadResourceConfig']();
    }).toThrowError('Configuration not found for type "documents"');
  });

  it('should get component view for search result', () => {
    expect(component.getResultItemComponentView()).toBe(null);

    component.types[0].component = {};
    expect(component.getResultItemComponentView()).toEqual({});
  });

  it('should configure component without routing', () => {
    component.inRouting = false;
    TestBed.get(ActivatedRoute).snapshot.data = {};

    component.ngOnInit();

    expect(component.inRouting).toBe(false);
  });

  it('should store author filters when it\'s not an array', () => {
    component.aggFilters = [];
    TestBed.get(ActivatedRoute).queryParams = of({
      q: '',
      page: 1,
      size: 10,
      author: 'Filippini, Massimo'
    });

    component.ngOnInit();

    expect(component.aggFilters.length).toBe(1);
    expect(component.aggFilters[0].values).toEqual(['Filippini, Massimo']);
  });
});
