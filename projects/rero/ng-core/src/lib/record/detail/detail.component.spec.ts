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
import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, RouterModule, convertToParamMap } from '@angular/router';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ActionStatus } from '../action-status';
import { RecordModule } from '../record.module';
import { RecordService } from '../record.service';
import { DetailComponent } from './detail.component';
import { JsonComponent } from './view/json.component';

const adminMode = (): Observable<ActionStatus> => {
  return of({
    can: true,
    message: ''
  });
};

export class ActivatedRouteStub {

  // Observable that contains a map of the parameters
  private subjectParamMap = new BehaviorSubject(convertToParamMap(this.testParamMap));
  paramMap = this.subjectParamMap.asObservable();
  private data = {};

  private _testParamMap: ParamMap;

  get testParamMap() {
    return this._testParamMap;
  }

  set testParamMap(params: {}) {
    this._testParamMap = convertToParamMap(params);
  }

  set testData(data) {
    this.data = data;
  }

  get snapshot() {
    return {
      paramMap: this.testParamMap,
      data: this.data
    };
  }
}

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  const recordServiceSpy = jasmine.createSpyObj('RecordService', ['getRecord']);

  const loc = jasmine.createSpyObj('Location', ['back']);

  const detailRecord = {
    id: '1',
    metadata: {
      pid: '1',
      title: 'Title'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        RouterModule.forRoot([]),
        RecordModule
      ],
      providers: [
        { provide: RecordService, useValue: recordServiceSpy },
        { provide: Location, useValue: loc },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
      ]
    });

    recordServiceSpy.getRecord.and.returnValue(of(detailRecord));
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testParamMap = { type: 'documents', pid: '1' };
    routeSpy.testData = {
      types: [
        {
          key: 'documents',
        }
      ],
      showSearchInput: true,
      adminMode
    };
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false if file configuration is not enabled', () => {
    expect(component.filesEnabled).toBeFalsy();
  });

  it('should raise exception when configuration not found for type', () => {
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testParamMap = { type: 'test', pid: '1' };
    expect(() => {
      /* tslint:disable:no-string-literal */
      component['loadViewComponentRef']();
    }).toThrowError('Configuration not found for type "test"');
  });

  it('should raise exception when no types are specified in configuration', () => {
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testData = {
      types: [],
      showSearchInput: true,
      adminMode
    };

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
    const routeSpy = TestBed.inject(ActivatedRoute);
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
    recordServiceSpy.getRecord.and.throwError('error');

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.record).toBe(null);
  });

  it('should use a custom view component for displaying record', () => {
    const routeSpy = TestBed.inject(ActivatedRoute);
    routeSpy.snapshot.data.types = [
      {
        key: 'documents',
        detailComponent: JsonComponent
      }
    ];
    expect(component.recordDetail).toBeDefined();
  });
});
