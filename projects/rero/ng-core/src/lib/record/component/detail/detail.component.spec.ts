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
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RecordService } from '../../service/record/record.service';
import { DetailComponent } from './detail.component';
import { DefaultDetailComponent } from './default-detail/default-detail.component';

const adminMode = true;

export class ActivatedRouteStub {
  // Observable that contains a map of the parameters
  private subjectParamMap = new BehaviorSubject(convertToParamMap(this.testParamMap));
  paramMap = this.subjectParamMap.asObservable();

  private subjectData = new BehaviorSubject<any>({});
  data = this.subjectData.asObservable();

  private _testParamMap!: ParamMap;

  get testParamMap() {
    return this._testParamMap;
  }

  set testParamMap(params: object) {
    this._testParamMap = convertToParamMap(params);
    this.subjectParamMap.next(this._testParamMap);
  }

  set testData(data: any) {
    this.subjectData.next(data);
  }

  get snapshot() {
    return {
      paramMap: this.testParamMap,
      data: this.subjectData.getValue(),
    };
  }
}

describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  const recordServiceSpy = {
    getRecord: vi.fn(),
  };

  const loc = {
    back: vi.fn(),
  };

  const detailRecord = {
    id: '1',
    metadata: {
      pid: '1',
      title: 'Title',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DetailComponent, TranslateModule.forRoot(), RouterModule.forRoot([])],
      providers: [
        { provide: RecordService, useValue: recordServiceSpy },
        { provide: Location, useValue: loc },
        { provide: ActivatedRoute, useClass: ActivatedRouteStub },
        ConfirmationService,
        MessageService,
      ],
    });

    recordServiceSpy.getRecord.mockReturnValue(of(detailRecord));
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testParamMap = { type: 'documents', pid: '1' };
    routeSpy.testData = {
      types: [
        {
          key: 'documents',
        },
      ],
      showSearchInput: true,
      adminMode,
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

  it('should resolve config for the current type', () => {
    expect(component['config']()).toBeTruthy();
    expect(component['config']()!.key).toEqual('documents');
  });

  it('should return null config when type is not found', () => {
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testParamMap = { type: 'unknown', pid: '1' };
    expect(component['config']()).toBeNull();
  });

  it('should return null config when types list is empty', () => {
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testData = { types: [], adminMode };
    expect(component['config']()).toBeNull();
  });

  it('should store an error message when API is not available', () => {
    recordServiceSpy.getRecord.mockReturnValue(throwError(() => new Error('error')));

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.record()).toBeUndefined();
  });

  it('should use a custom view component for displaying record', () => {
    const routeSpy = TestBed.inject(ActivatedRoute) as any;
    routeSpy.testData = {
      types: [
      {
        key: 'documents',
        detailComponent: DefaultDetailComponent,
      },
      ],
      showSearchInput: true,
      adminMode,
    };
    fixture.detectChanges();
    expect(component.dynamicHost()).toBeDefined();
  });
});
