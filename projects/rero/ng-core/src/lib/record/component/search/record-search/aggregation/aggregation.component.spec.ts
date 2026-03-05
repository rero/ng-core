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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { RecordSearchStore } from '../../store/record-search.store';
import { RecordSearchAggregationComponent } from './aggregation.component';

describe('RecordSearchAggregationComponent', () => {
  let component: RecordSearchAggregationComponent;
  let componentRef: ComponentRef<RecordSearchAggregationComponent>;
  let fixture: ComponentFixture<RecordSearchAggregationComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NoopAnimationsModule,
        PanelModule,
        CheckboxModule,
        TranslateModule.forRoot(),
        RecordSearchAggregationComponent,
      ],
      providers: [RecordSearchStore, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()],
    })
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchAggregationComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('aggregation', {
      key: 'author',
      bucketSize: 2,
      value: {
        buckets: [
          {
            doc_count: 30,
            key: 'Filippini, Massimo',
          },
          {
            doc_count: 9,
            key: 'Botturi, Luca',
          },
        ],
      },
      expanded: false,
      type: 'terms',
      config: {},
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expand the aggregation on toggle click', () => {
    expect(component.aggregation().expanded).toBe(false);
    const toggleable = fixture.debugElement.nativeElement.querySelector('button');
    toggleable.click();
    expect(component.aggregation().expanded).toBe(true);
  });
});
