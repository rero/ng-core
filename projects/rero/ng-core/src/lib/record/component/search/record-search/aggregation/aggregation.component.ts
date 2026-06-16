// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
  protected store = inject(RecordSearchStore);

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
    if (this.aggregationFilters().length > 0) {
      return;
    }
    const agg = this.aggregation();
    const expanded = !agg.expanded;
    this.store.setAggregationExpanded(agg.key, expanded);
    if (expanded) {
      this.store.fetchAggregationBuckets({ aggregationKey: agg.key });
    }
  }
}
