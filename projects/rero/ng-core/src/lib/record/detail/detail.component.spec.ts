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
import { Location } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { DetailComponent } from './detail.component';
import { RecordService } from '../record.service';
import { JsonComponent } from './view/json.component';
import { RecordDetailDirective } from './detail.directive';

describe('RecordDetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let recordServiceSpy: jasmine.SpyObj<RecordService>;

  const loc = jasmine.createSpyObj('Location', ['back']);

  const route = {
    snapshot: {
      paramMap: convertToParamMap({
        type: 'documents', pid: '1'
      }),
      data: {
        types: [
          {
            key: 'documents',
          }
        ],
        showSearchInput: true,
        adminMode: true
      }
    }
  };

  const detailRecord = {
    id: '1',
    metadata: {
      pid: '1',
      title: 'Title'
    }
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('RecordService', ['getRecord']);

    TestBed.configureTestingModule({
      declarations: [
        DetailComponent,
        JsonComponent,
        RecordDetailDirective
      ],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        RouterTestingModule,
        ModalModule.forRoot(),
        ToastrModule.forRoot()
      ],
      providers: [
        { provide: RecordService, useValue: spy },
        { provide: Location, useValue: loc },
        { provide: ActivatedRoute, useValue: route }
      ]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [JsonComponent],
        }
      });

    recordServiceSpy = TestBed.get(RecordService);
    recordServiceSpy.getRecord.and.returnValue(of(detailRecord));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.record).toEqual(detailRecord);
  });

  it('should go back', () => {
    component.goBack();
    expect(loc.back).toHaveBeenCalledTimes(1);
  });

  it('should raise exception when configuration not found for type', () => {
    const routeSpy = TestBed.get(ActivatedRoute);
    routeSpy.snapshot.paramMap = convertToParamMap({
      type: 'test', pid: '1'
    });

    expect(() => {
      /* tslint:disable:no-string-literal */
      component['loadViewComponentRef']();
    }).toThrowError('Configuration not found for type "test"');
  });

  it('should raise exception when no types are specified in configuration', () => {
    const routeSpy = TestBed.get(ActivatedRoute);
    routeSpy.snapshot.data.types = [];

    expect(() => {
      /* tslint:disable:no-string-literal */
      component['loadViewComponentRef']();
    }).toThrowError('Configuration types not passed to component');

    delete routeSpy.snapshot.data.types;

    expect(() => {
      /* tslint:disable:no-string-literal */
      component['loadViewComponentRef']();
    }).toThrowError('Configuration types not passed to component');
  });

  it('should store component for viewing notice detail', () => {
    const routeSpy = TestBed.get(ActivatedRoute);
    routeSpy.snapshot.data.types = [
      {
        key: 'documents',
        detailComponent: JsonComponent
      }
    ];

    /* tslint:disable:no-string-literal */
    component['loadViewComponentRef']();
    expect(component.viewComponent).toEqual(JsonComponent);
  });

  it('should store an error message when API is not available', () => {
    recordServiceSpy = TestBed.get(RecordService);
    recordServiceSpy.getRecord.and.returnValue(throwError('error'));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.record).toBe(null);
    expect(component.error).toBe('error');
  });

  it('should use a custom view component for displaying record', () => {
    const routeSpy = TestBed.get(ActivatedRoute);
    routeSpy.snapshot.data.types = [
      {
        key: 'documents',
        detailComponent: JsonComponent
      }
    ];

    component.viewComponent = JsonComponent;
    component['loadRecordView']();
  });
});
