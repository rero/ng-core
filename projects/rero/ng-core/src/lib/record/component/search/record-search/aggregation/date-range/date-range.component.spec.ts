/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
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
import { CommonModule } from '@angular/common';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { RecordSearchStore } from '../../../store/record-search.store';
import { AggregationDateRangeComponent } from './date-range.component';
import { RippleModule } from 'primeng/ripple';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'primeng/api';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AggregationDateRangeComponent', () => {
  let fixture: ComponentFixture<AggregationDateRangeComponent>;
  let component: AggregationDateRangeComponent;
  let componentRef: ComponentRef<AggregationDateRangeComponent>;
  let store: InstanceType<typeof RecordSearchStore>;
  let dateMin: number;
  let dateMax: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecordSearchStore, provideHttpClient(), provideHttpClientTesting()],
      imports: [
        CommonModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
        DatePickerModule,
        SharedModule,
        ButtonModule,
        RippleModule,
        FormsModule,
        TranslateModule.forRoot(),
        AggregationDateRangeComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationDateRangeComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    store = TestBed.inject(RecordSearchStore);
    componentRef.setInput('key', 'date_range');
    dateMin = new Date('2025-01-01').getTime();
    dateMax = new Date('2025-01-31').getTime();
    store.updateAggregations([
      {
        key: 'date_range',
        config: { min: dateMin, max: dateMax },
        bucketSize: 0,
        value: { buckets: [] },
        expanded: true,
        doc_count: 0,
        name: 'date_range',
      },
    ]);
    fixture.detectChanges();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
    expect(component.dateRangeModel()).toHaveLength(2);
    expect(component.buttonConfig()).toHaveLength(4);
    expect(component.dateRangeModel()[0]).toEqual(new Date(dateMin));
    expect(component.dateRangeModel()[1]).toEqual(new Date(new Date(dateMax).setHours(23, 59, 59)));
  });

  it('should return a list of active filters', async () => {
    const date1 = new Date('2025-01-10');
    const date2 = new Date('2025-01-20');
    const date2Offset = new Date(date2.getTime()).setHours(23, 59, 59);
    component.setRange([date1, date2]);

    const filters = store.aggregationsFilters();
    if (filters && filters.length > 0) {
      expect(filters[0]).toEqual({
        key: 'date_range',
        values: [`${date1.getTime()}--${date2Offset}`],
      });
    }
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 100));
    fixture.detectChanges();
    expect(component.dateRangeModel()[0]).toEqual(date1);
    expect(component.dateRangeModel()[1]).toEqual(new Date(date2Offset));
  });
});
