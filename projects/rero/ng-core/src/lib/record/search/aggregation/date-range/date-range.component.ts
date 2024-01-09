/*
 * RERO angular core
 * Copyright (C) 2021-2024 RERO
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
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {RecordSearchService} from '../../record-search.service';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'ng-core-aggregation-date-range',
  templateUrl: './date-range.component.html'
})
export class AggregationDateRangeComponent implements OnInit, OnDestroy {

  // COMPONENTS ATTRIBUTES ====================================================
  /** Buckets list. */
  @Input() buckets: Array<any>;
  /** Aggregation key. */
  @Input() key: string;
  /** Components configuration. */
  @Input() config: any;

  /** model used for bsDatePicker field */
  dateRangeModel: Date[];
  /** bsDatePicker configuration. */
  bsConfig: any = {
    isAnimated: true,
    containerClass: 'theme-dark-blue'
  };
  /** True if route have aggregation query param. */
  hasQueryParam = false;

  /** Subscription to search service. */
  private searchServiceSubscription: Subscription;

  // CONSTRUCTOR & HOOKS ======================================================
  constructor(
      private recordSearchService: RecordSearchService,
      private translateService: TranslateService
  ) { }

  /** OnInit hook */
  ngOnInit(): void {
    // Define min/max values if not exists
    if (!this.config.hasOwnProperty('min') || this.config.min < 0) {
      this.config.min = 0;
    }
    if (!this.config.hasOwnProperty('max')) {
      this.config.max = new Date();
      this.config.max.setFullYear(this.config.max.getFullYear() + 1).getTime();
    }

    // Build bsDateRangePicker configuration
    this.bsConfig.maxDate = new Date(this.config.max);
    this.bsConfig.minDate = new Date(this.config.min);
    const today = new Date();
    this.bsConfig.ranges = [{
      value: [new Date(new Date().setDate(today.getDate() - 7)), today],
      label: this.translateService.instant(_('Last 7 days'))
    }, {
      value: [new Date(new Date().setDate(today.getDate() - 31)), today],
      label: this.translateService.instant(_('Last month'))
    }, {
      value: [new Date(new Date().setDate(today.getDate() - 366)), today],
      label: this.translateService.instant(_('Last year'))
    }, {
      value: [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)],
      label: this.translateService.instant(_('This month'))
    }, {
      value: [new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear() + 1, 0, 1)],
      label: this.translateService.instant(_('This year'))
    }];

    this.dateRangeModel = [this.config.min, this.config.max];
    this.searchServiceSubscription = this.recordSearchService.aggregationsFilters.subscribe((filters: any) => {
      if (!filters) {
        return;
      }
      const filter = filters.find((element: any) => element.key === this.key);
      this.hasQueryParam = filter !== undefined;
      this.dateRangeModel = (filter)
        ? filter.values[0].split('--').map((item: string) => new Date(+item))  // split filter data and transform each part into Date
        : [];
    });
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.searchServiceSubscription.unsubscribe();
  }

  // COMPONENTS FUNCTIONS =====================================================
  /** Update aggregation filter. */
  updateFilter() {
    if (this.dateRangeModel && this.dateRangeModel[0] && this.dateRangeModel[1]) {
      this.recordSearchService.updateAggregationFilter(this.key, [
          `${this.dateRangeModel[0].getTime()}--${this.dateRangeModel[1].getTime()}`
      ]);
    }
  }

  /** Clear aggregation filter. */
  clearFilter() {
    this.recordSearchService.updateAggregationFilter(this.key, []);
  }
}
