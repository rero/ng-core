/*
 * RERO angular core
 * Copyright (C) 2021-2025 RERO
 * Copyright (C) 2021 UCLouvain
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
import { Component, OnDestroy, OnInit, inject, input } from '@angular/core';
import { Subscription } from 'rxjs';
import { RecordSearchService } from '../../record-search.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ng-core-aggregation-date-range',
  templateUrl: './date-range.component.html'
})
export class AggregationDateRangeComponent implements OnInit, OnDestroy {

  protected recordSearchService: RecordSearchService = inject(RecordSearchService);
  protected translateService: TranslateService = inject(TranslateService);

  // COMPONENTS ATTRIBUTES ====================================================
  // Aggregation key
  key = input.required<string>();
  // Components configuration
  config = input.required<any>();

  // Model used for Datepicker field.
  dateRangeModel: Date[] | undefined;
  // Date minimum
  minDate: any = null;
  // Date maximum
  maxDate: any = null;

  /** True if route have aggregation query param. */
  hasQueryParam = false;
  buttonConfig = [];

  /** Subscription to search service. */
  private searchServiceSubscription: Subscription;

  /** OnInit hook */
  ngOnInit(): void {
    // Define min/max values if not exists
    if (this.config().min) {
      this.minDate = new Date(this.config().min);
    } else{
      this.minDate = new Date(1900, 0, 0);
    }
    if (this.config().max) {
      this.maxDate = new Date(this.config().max);
    } else {
      this.maxDate = new Date();
    }
    this.dateRangeModel = [this.minDate, this.maxDate];

    this.searchServiceSubscription = this.recordSearchService.aggregationsFilters.subscribe((filters: any) => {
      if (!filters) {
        return;
      }
      const filter = filters.find((element: any) => element.key === this.key());
      this.hasQueryParam = filter !== undefined;
      this.dateRangeModel = (filter)
        ? filter.values[0].split('--').map((item: string) => new Date(+item))  // split filter data and transform each part into Date
        :  [this.minDate, this.maxDate];
    });
    const today = new Date();
    this.buttonConfig = [
    {
      value: [new Date(new Date().setDate(today.getDate() - 31)), today],
      label: this.translateService.instant('Last month')
    }, {
      value: [new Date(new Date().setDate(today.getDate() - 366)), today],
      label: this.translateService.instant('Last year')
    }, {
      value: [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)],
      label: this.translateService.instant('This month')
    },
    {
      value: [new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear() + 1, 0, 1)],
      label: this.translateService.instant('This year')
    }
  ];
  }
  setRange(value: Date[]) {
    this.dateRangeModel = value;
    this.updateFilter();
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.searchServiceSubscription.unsubscribe();
  }

  // COMPONENTS FUNCTIONS =====================================================
  /** Update aggregation filter. */
  updateFilter() {
    if (this.dateRangeModel && this.dateRangeModel[0] && this.dateRangeModel[1]) {
      this.recordSearchService.updateAggregationFilter(this.key(), [
          `${this.dateRangeModel[0].getTime()}--${this.dateRangeModel[1].getTime()}`
      ]);
    }
  }

  /** Clear aggregation filter. */
  clearFilter(): void {
    this.recordSearchService.updateAggregationFilter(this.key(), []);
  }
}
