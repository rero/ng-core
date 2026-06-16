// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputNumber } from 'primeng/inputnumber';
import { RecordSearchStore } from '../../../store/record-search.store';

@Component({
  selector: 'ng-core-aggregation-slider',
  templateUrl: './slider.component.html',
  imports: [InputGroup, InputNumber, FormsModule, Button, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AggregationSliderComponent {
  protected store = inject(RecordSearchStore);

  // COMPONENT ATTRIBUTES =====================================================
  /** The aggregation key. */
  key = input.required<string>();

  // COMPUTED SIGNALS ==========================================================
  /** Aggregation config derived from the store. */
  private readonly aggregation = computed(() => this.store.aggregations()?.find((a: any) => a.key === this.key()));

  readonly min = computed(() => this.aggregation()?.config?.min ?? 1);
  readonly max = computed(() => this.aggregation()?.config?.max ?? 100);
  readonly step = computed(() => this.aggregation()?.config?.step ?? 1);

  /** True if route have aggregation query param. */
  readonly hasQueryParam = computed(() => this.store.aggregationsFilters().some((f: any) => f.key === this.key()));

  /** Range to search. Derived from store filters, but writable by the user. */
  readonly range = linkedSignal<number[]>(() => {
    const filter = this.store.aggregationsFilters().find((f: any) => f.key === this.key());
    return filter ? filter.values[0].split('--').map((item: string) => +item) : [this.min(), this.max()];
  });

  // COMPONENT FUNCTIONS ======================================================
  /** Update aggregation filter. */
  updateFilter() {
    const r = [...this.range()];
    if (!r[0] || r[0] < this.min()) {
      r[0] = this.min();
    }
    if (!r[1] || r[1] > this.max()) {
      r[1] = this.max();
    }
    this.store.updateAggregationsFilter(this.key(), [`${r[0]}--${r[1]}`]);
  }

  /** Clear aggregation filter. */
  clearFilter() {
    this.store.updateAggregationsFilter(this.key(), []);
  }
}
