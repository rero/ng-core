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

import { RecordSearchComponent } from './record-search-page.component';
import { DefaultPipe } from '../../pipe/default.pipe';
import { UpperCaseFirstPipe } from '../../pipe/ucfirst.pipe';
import { SearchInputComponent } from '../../search-input/search-input.component';
import { RecordSearchAggregationComponent } from './aggregation/aggregation.component';
import { RecordSearchResultComponent } from './result/record-search-result.component';
import { RecordService } from '../record.service';
import { DialogComponent } from '../../dialog/dialog.component';
import { Nl2brPipe } from '../../pipe/nl2br.pipe';
import { DialogService } from '../../dialog/dialog.service';
import { TranslateLanguagePipe } from '../../translate/translate-language.pipe';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecordSearchComponent', () => {
  let component: RecordSearchComponent;
  let fixture: ComponentFixture<RecordSearchComponent>;

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

  const dialogServiceSpy = jasmine.createSpyObj('DialogService', ['show']);
  dialogServiceSpy.show.and.returnValue(of(true));

  const route = {
    snapshot: {
      data: {
        detailUrl: '/custom/url/for/detail/:type/:pid',
        types: [
          {
            key: 'documents'
          },
          {
            key: 'institutions'
          }
        ],
        showSearchInput: true,
        adminMode: true
      },
      params: { type: 'documents' }
    },
    queryParamMap: of(convertToParamMap({
      q: '',
      page: 1,
      size: 10,
      author: ['Filippini, Massimo']
    })),
    paramMap: of(convertToParamMap({ type: 'documents' })),
    queryParams: of({})
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
        DialogComponent,
        TranslateLanguagePipe
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        RouterTestingModule,
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
        { provide: DialogService, useValue: dialogServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [DialogComponent]
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
});
