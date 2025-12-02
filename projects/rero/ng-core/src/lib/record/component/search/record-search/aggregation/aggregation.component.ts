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
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BucketsComponent } from './buckets/buckets.component';
import { Fieldset } from 'primeng/fieldset';
import { AggregationSliderComponent } from './slider/slider.component';
import { AggregationDateRangeComponent } from './date-range/date-range.component';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { Aggregation } from '../../../../../model/record.interface';
import { UpperCaseFirstPipe } from '../../../../../core/pipe/ucfirst/ucfirst.pipe';
import { RecordSearchStore } from '../../store/record-search.store';

@Component({
  selector: 'ng-core-record-search-aggregation',
  templateUrl: './aggregation.component.html',
  imports: [
    BucketsComponent,
    Fieldset,
    AggregationSliderComponent,
    AggregationDateRangeComponent,
    TranslateDirective,
    TranslatePipe,
    UpperCaseFirstPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordSearchAggregationComponent {
  private store = inject(RecordSearchStore);

  // COMPONENT ATTRIBUTES =====================================================
  /** Aggregation data */
  aggregation = input.required<Aggregation>();

  // COMPUTED SIGNALS ==========================================================
  /** Returns selected filter values for this aggregation key. */
  readonly aggregationFilters = computed(
    () => this.store.aggregationsFilters().find((item: any) => item.key === this.aggregation().key)?.values ?? [],
  );

  /** Whether the aggregation panel should be expanded. */
  readonly isAggregationDisplayed = computed(() => this.aggregation().expanded || this.aggregationFilters().length > 0);

  // PUBLIC METHODS ========================================================

  /**
   * Method called when the title of an aggregation is clicked.
   */
  toggleVisibility(): void {
    // if filters are selected, we do nothing.
    if (this.aggregationFilters().length > 0) {
      return;
    }
    // Toggle aggregation expanded attribute
    this.aggregation().expanded = !this.aggregation().expanded;
    // If expanded and aggregations exist, fetch buckets from store
    if (this.aggregation().expanded && this.store.aggregations()) {
      this.store.fetchAggregationBuckets({ aggregationKey: this.aggregation().key });
    }
  }
}
