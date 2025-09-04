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
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, inject, input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AggregationsFilter, RecordSearchService } from '../../record-search.service';
import { IBucket } from '../list-filters/list-filters.component';

@Component({
    selector: 'ng-core-record-search-aggregation-buckets',
    templateUrl: './buckets.component.html',
    standalone: false
})
export class BucketsComponent implements OnInit, OnDestroy, OnChanges {

  protected recordSearchService: RecordSearchService = inject(RecordSearchService);

  // COMPONENT ATTRIBUTES ============================================================
  /** Buckets list for aggregation */
  buckets = input.required<IBucket[]>();
  /** Aggregation key */
  aggregationKey = input.required<string>();
  /** Bucket size, if not null, reduce displayed items to this size. */
  size = input<number|null>();

  /** More and less on aggregation content (facet) */
  moreMode = true;
  /** Current selected values for the aggregations */
  aggregationsFilters: AggregationsFilter[] = [];
  /** Children of current bucket */
  bucketChildren: Record<string, IBucket[]> = {};


  /** Subscription to aggregationsFilters observable */
  private aggregationsFiltersSubscription: Subscription;


  // GETTERS & SETTERS =================================================================
  /** Returns selected filters for the aggregation key. */
  get aggregationFilters(): string[] {
    const aggregationFilters = this.aggregationsFilters.find((item: AggregationsFilter) => item.key === this.aggregationKey());
    return aggregationFilters === undefined
        ? []
        : aggregationFilters.values;
  }

  /** Get bucket size. */
  get bucketSize(): number {
    const size = this.buckets().length;
    return this.size() === null || this.moreMode === false
        ? size
        : this.size();
  }

  /** Get the number of bucket items with non-zero doc_count. */
  get bucketsLength(): number {
    return this.buckets().reduce((acc, bucket) => (bucket.doc_count) ? acc+1 : acc, 0);
  }

  /** Should display more or less link for a bucket ? */
  get displayMoreAndLessLink(): boolean {
    return (this.size() === null)
        ? false
        : this.bucketsLength > this.size();
  }

  /**
   * OnInit hook
   *   Subscribe to aggregations filters observable for getting the aggregations filters each time
   *   they will change.
   */
  ngOnInit() {
    this.aggregationsFiltersSubscription = this.recordSearchService
        .aggregationsFilters
        .subscribe((aggregationsFilters: AggregationsFilter[]) => {
          if (aggregationsFilters !== null) {
            this.aggregationsFilters = aggregationsFilters;
          }
        });
  }

  /**
   * OnChanges hook
   *   Called each time an input property is modified.
   *   If buckets are changed, refresh children buckets.
   * @param changes - bucket changes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.buckets) {
      for (const bucket of this.buckets()) {
        this.bucketChildren[bucket.key] = this.getBucketChildren(bucket);
      }
    }
  }

  /**
   * OnDestroy hook
   *   Unsubscribes from the observable of aggregations filters.
   */
  ngOnDestroy() {
    this.aggregationsFiltersSubscription.unsubscribe();
  }

  // COMPONENT F£UNCTIONS =====================================================
  /**
   * Check if a value is present in selected filters.
   * @param value: filter value (could be string, number, ...)
   * @return `true` if value is present in the aggregation filters, `null` otherwise.
   */
  isSelected(value: string | number): boolean | null {
  return this.aggregationFilters.includes(value.toString()) ? true : null;
}

  /**
   * Do we need to display the children?
   * @return `true` if we want to display the children, `false` otherwise.
   */
  displayChildren(bucket : IBucket): boolean {
    return (
      this.isSelected(bucket.key) ||
      // not necessary but faster than hasChildrenFilter
      bucket.indeterminate ||
      // hasChildrenFilter is required to avoid blinks when a child is selected
      this.recordSearchService.hasChildrenFilter(bucket)
    );
  }

  /**
   * Update selected filters by adding or removing the given value and push
   * values to service.
   * @param bucket - string: the selected bucket value (checked OR unchecked)
   */
  updateFilter(bucket: IBucket) {
  const index = this.aggregationsFilters.findIndex(
    (item: AggregationsFilter) => item.key === this.aggregationKey()
  );

  if (index === -1) {
    // No filters exist for the aggregation.
    this.recordSearchService.updateAggregationFilter(this.aggregationKey(), [bucket.key], bucket);
  } else {
    const aggFilter = this.aggregationsFilters[index];
    if (!aggFilter.values.includes(bucket.key.toString())) {
      // Bucket value is not yet selected, we add value to selected values.
      this.aggregationsFilters[index].values.push(bucket.key.toString());
      this.recordSearchService.updateAggregationFilter(
        this.aggregationKey(),
        this.aggregationsFilters[index].values,
        bucket
      );
    } else {
      // Removes value from selected values and all children selected values.
      this.recordSearchService.removeAggregationFilter(this.aggregationKey(), bucket);
    }
  }
}


  /**
   * Get children buckets
   * @param bucket: parent bucket
   * @return Bucket children list of given bucket
   */
  getBucketChildren(bucket: IBucket): IBucket[] {
  const children: IBucket[] = [];

  for (const k of Object.keys(bucket).filter(
    key => typeof bucket[key] === 'object' && Array.isArray(bucket[key])
  )) {
    children.push({
      aggregationKey: k,
      key: k,
      buckets: bucket[k] as IBucket[],
      bucketSize: this.bucketSize
    } as IBucket);
  }

  return children;
}
}
