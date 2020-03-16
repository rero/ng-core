import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

export interface AggregationsFilter {
  key: string;
  values: Array<any>;
}

@Injectable({
  providedIn: 'root'
})
export class RecordSearchService {

  /** Aggregations filters */
  private _aggregationsFilters: BehaviorSubject<Array<AggregationsFilter>>;

  constructor() {
    this._aggregationsFilters = new BehaviorSubject([]);
   }

  get aggregationsFilters(): Observable<Array<AggregationsFilter>> {
    return this._aggregationsFilters.asObservable();
  }

  setAggregationsFilters(aggregationsFilters: Array<AggregationsFilter>) {
    this._aggregationsFilters.next([...aggregationsFilters]);
  }

  /**
   * Store or remove facet filter.
   * @param term Term (aggregation key)
   * @param values Selected values
   */
  updateAggregationFilter(term: string, values: string[]) {
    console.log('service', values);
    this.aggregationsFilters.pipe(first()).subscribe((aggregationsFilters: Array<AggregationsFilter>) => {
      const index = aggregationsFilters.findIndex(item => item.key === term);
      if (values.length === 0) {
        // no more items selected, remove filter
        aggregationsFilters.splice(index, 1);
      } else {
        if (index !== -1) {
          // update existing filter
          aggregationsFilters[index] = { key: term, values };
        } else {
          // add new filter
          aggregationsFilters.push({ key: term, values });
        }
      }
      this._aggregationsFilters.next([...aggregationsFilters]);
    });
  }

  /**
   * Get selected values of current aggregation
   * @param term Aggregation key
   */
  getAggregationSelectedValues(term: string): Observable<Array<string>> {
    return this.aggregationsFilters.pipe(
      first(),
      map((aggregationsFilters: Array<AggregationsFilter>) => {
        const index = aggregationsFilters.findIndex(item => item.key === term);
        return index === -1 ? [] : aggregationsFilters[index].values;
      })
    );
  }
}
