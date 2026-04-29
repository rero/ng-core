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
import { AsyncPipe, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { Bucket } from '../../../../../../model';
import { AggregationsFilter } from '../../../model/aggregations-filter.interface';
import { RecordSearchStore } from '../../../store/record-search.store';
import { Observable, of, shareReplay } from 'rxjs';

@Component({
  selector: 'ng-core-record-search-aggregation-buckets',
  templateUrl: './buckets.component.html',
  imports: [Checkbox, FormsModule, SlicePipe, TranslatePipe, Button, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BucketsComponent {
  protected store = inject(RecordSearchStore);
  private translateService = inject(TranslateService);

  readonly enrichedBuckets = computed(() => {
    const processFn = this.store.config().processBucketName;
    return this.buckets().map((bucket) => ({
      ...bucket,
      label$: (processFn
        ? processFn(bucket).pipe(shareReplay(1))
        : bucket.name
          ? of(bucket.name)
          : this.translateService.stream(bucket.key)) as Observable<string>,
    }));
  });

  // COMPONENT ATTRIBUTES ============================================================
  /** Buckets list for aggregation */
  buckets = input.required<Bucket[]>();
  /** Aggregation key */
  aggregationKey = input.required<string>();

  /** More and less on aggregation content (facet) */
  moreMode = signal(true);

  // COMPUTED SIGNALS =================================================================
  /** Aggregation config derived from the store. */
  private readonly aggregation = computed(() =>
    this.store.aggregations()?.find((a: any) => a.key === this.aggregationKey()),
  );

  /** Returns selected filters for the aggregation key. */
  readonly aggregationFilters = computed(
    () =>
      this.store.aggregationsFilters().find((item: AggregationsFilter) => item.key === this.aggregationKey())?.values ??
      [],
  );

  /** Get bucket size. */
  readonly bucketSize = computed(() => {
    const size = this.buckets().length;
    const configuredSize = this.aggregation()?.bucketSize ?? 0;
    return configuredSize == 0 || !this.moreMode() ? size : configuredSize;
  });

  /** Get the number of bucket items with non-zero doc_count. */
  readonly bucketsLength = computed(() =>
    this.buckets().reduce((acc, bucket) => (bucket.doc_count ? acc + 1 : acc), 0),
  );

  /** Should display more or less link for a bucket ? */
  readonly displayMoreAndLessLink = computed(() => {
    const configuredSize = this.aggregation()?.bucketSize ?? 0;
    if (configuredSize == 0) {
      return false;
    }
    return this.bucketsLength() > configuredSize;
  });

  /** Children of current bucket, derived from buckets input. */
  readonly bucketChildren = computed(() => {
    const children: Record<string, { aggregationKey: string; key: string; buckets: Bucket[] }[]> = {};
    for (const bucket of this.buckets()) {
      children[bucket.key] = this.getBucketChildren(bucket);
    }
    return children;
  });

  // COMPONENT FUNCTIONS =====================================================
  /**
   * Check if a value is present in selected filters.
   * @param value: filter value (could be string, number, ...)
   * @return `true` if value is present in the aggregation filters, `null` otherwise.
   */
  isSelected(value: string | number): boolean | null {
    return this.aggregationFilters().includes(value.toString()) ? true : null;
  }

  /**
   * Do we need to display the children?
   * @return `true` if we want to display the children, `false` otherwise.
   */
  displayChildren(bucket: Bucket): boolean {
    return (
      this.isSelected(bucket.key) ||
      // not necessary but faster than hasChildrenFilter
      bucket.indeterminate ||
      // hasChildrenFilter is required to avoid blinks when a child is selected
      this.store.hasChildrenFilter(bucket)
    );
  }

  /**
   * Update selected filters by adding or removing the given value and push
   * values to service.
   * @param bucket - string: the selected bucket value (checked OR unchecked)
   */
  updateFilter(bucket: Bucket) {
    const filters = this.store.aggregationsFilters();
    const index = filters.findIndex((item: AggregationsFilter) => item.key === this.aggregationKey());
    if (index === -1) {
      // No filters exist for the aggregation.
      this.store.updateAggregationsFilter(this.aggregationKey(), [bucket.key], bucket);
    } else {
      const aggFilter = filters[index];
      if (!aggFilter.values.includes(bucket.key.toString())) {
        // Bucket value is not yet selected, we add value to selected values.
        const newValues = [...aggFilter.values, bucket.key.toString()];
        this.store.updateAggregationsFilter(this.aggregationKey(), newValues, bucket);
      } else {
        // Removes value from selected values and all children selected values.
        this.store.removeAggregationFilter(this.aggregationKey(), bucket);
      }
    }
  }

  /**
   * Get children buckets
   * @param bucket: parent bucket
   * @return Bucket children list of given bucket
   */
  private getBucketChildren(bucket: Bucket): { aggregationKey: string; key: string; buckets: Bucket[] }[] {
    const children = [];
    for (const k of Object.keys(bucket).filter((key) => typeof bucket[key] === 'object' && bucket[key].buckets)) {
      children.push({
        aggregationKey: k,
        key: k,
        buckets: bucket[k].buckets,
      });
    }
    return children;
  }
}
