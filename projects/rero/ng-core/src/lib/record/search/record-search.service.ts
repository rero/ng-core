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
  private _aggregationsFilters: Array<AggregationsFilter> = [];

  /** Aggregations filters */
  private _aggregationsFiltersSubject: BehaviorSubject<Array<AggregationsFilter>>;

  constructor() {
    this._aggregationsFiltersSubject = new BehaviorSubject([]);
  }

  get aggregationsFilters(): Observable<Array<AggregationsFilter>> {
    return this._aggregationsFiltersSubject.asObservable();
  }

  setAggregationsFilters(aggregationsFilters: Array<AggregationsFilter>, forceChange = false) {
    if (forceChange === true || JSON.stringify(this._aggregationsFilters) !== JSON.stringify(aggregationsFilters)) {
      console.log('agg filters changed', aggregationsFilters, this._aggregationsFilters);
      this._aggregationsFilters = aggregationsFilters;
      this._aggregationsFiltersSubject.next(this._aggregationsFilters);
    }
  }

  /**
   * Store or remove facet filter.
   * @param term Term (aggregation key)
   * @param values Selected values
   */
  updateAggregationFilter(term: string, values: string[]) {
    const index = this._aggregationsFilters.findIndex(item => item.key === term);

    if (values.length === 0) {
      // no more items selected, remove filter
      this._aggregationsFilters.splice(index, 1);
    } else {
      if (index !== -1) {
        // update existing filter
        this._aggregationsFilters[index] = { key: term, values };
      } else {
        // add new filter
        this._aggregationsFilters.push({ key: term, values });
      }
    }
    this._aggregationsFiltersSubject.next(this._aggregationsFilters);
  }

  /**
   * Get selected values of current aggregation
   * @param term Aggregation key
   */
  getAggregationSelectedValues(term: string): Observable<Array<string>> {
    return this._aggregationsFiltersSubject.pipe(
      first(),
      map((aggregationsFilters: Array<AggregationsFilter>) => {
        const index = aggregationsFilters.findIndex(item => item.key === term);
        return index === -1 ? [] : aggregationsFilters[index].values;
      })
    );
  }
}
