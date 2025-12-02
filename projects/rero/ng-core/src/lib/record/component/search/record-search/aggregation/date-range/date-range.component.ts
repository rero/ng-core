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
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Divider } from 'primeng/divider';
import { RecordSearchStore } from '../../../store/record-search.store';

export interface Filter {
  key: string;
  values: string[];
}

@Component({
  selector: 'ng-core-aggregation-date-range',
  templateUrl: './date-range.component.html',
  imports: [DatePicker, FormsModule, Divider, Button, TranslatePipe]
})
export class AggregationDateRangeComponent {

  protected store = inject(RecordSearchStore);
  protected translateService: TranslateService = inject(TranslateService);

  // COMPONENTS ATTRIBUTES ====================================================
  // Aggregation key
  key = input.required<string>();

  // COMPUTED SIGNALS ==========================================================
  /** Aggregation config derived from the store. */
  private readonly aggregation = computed(() =>
    this.store.aggregations()?.find((a: any) => a.key === this.key())
  );

  // Date minimum
  readonly minDate = computed(() => {
    const min = this.aggregation()?.config?.min;
    return min ? new Date(min) : new Date(1900, 0, 1);
  });

  // Date maximum
  readonly maxDate = computed(() => {
    const max = this.aggregation()?.config?.max;
    const d = max ? new Date(max) : new Date();
    return new Date(d.setHours(23, 59, 59));
  });

  /** True if route have aggregation query param. */
  readonly hasQueryParam = computed(() =>
    this.store.aggregationsFilters().some(f => f.key === this.key())
  );

  /** Model used for Datepicker field. Derived from store filters, but writable by the user. */
  readonly dateRangeModel = linkedSignal<Date[]>(() => {
    const filter = this.store.aggregationsFilters().find((f: Filter) => f.key === this.key());
    return filter
      ? filter.values[0].split('--').map((item: string) => new Date(+item))
      : [this.minDate(), this.maxDate()];
  });

  private readonly today = signal(new Date());
  private readonly langChange = toSignal(this.translateService.onLangChange);

  readonly buttonConfig = computed(() => {
    this.langChange(); // track language changes
    const today = this.today();
    return [
      {
        value: [new Date(new Date().setDate(today.getDate() - 31)), today],
        label: this.translateService.instant('Last month')
      }, {
        value: [new Date(new Date().setDate(today.getDate() - 366)), today],
        label: this.translateService.instant('Last year')
      }, {
        value: [new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth() + 1, 0)],
        label: this.translateService.instant('This month')
      }, {
        value: [new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear() + 1, 0, 1)],
        label: this.translateService.instant('This year')
      }
    ];
  });

  setRange(value: Date[]) {
    this.dateRangeModel.set(value);
    this.updateFilter();
  }

  // COMPONENTS FUNCTIONS =====================================================
  /** Update aggregation filter. */
  updateFilter() {
    const model = this.dateRangeModel();
    if (model && model[0] && model[1]) {
      const maxDate = new Date(model[1]).setHours(23, 59, 59);
      this.store.updateAggregationsFilter(this.key(), [
        `${model[0].getTime()}--${maxDate}`
      ]);
    }
  }

  /** Clear aggregation filter. */
  clearFilter(): void {
    this.store.updateAggregationsFilter(this.key(), []);
  }
}
