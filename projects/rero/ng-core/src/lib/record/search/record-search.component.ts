/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { RecordService } from '../record.service';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';

@Component({
  selector: 'ng-core-record-search',
  templateUrl: './record-search.component.html',
  styles: []
})
export class RecordSearchComponent implements OnInit {
  /**
   * Contain result data
   */
  records: object[] = [];

  /**
   * Total of records corresponding to request
   */
  total = 0;

  /**
   * Facets retreived from request result
   */
  aggregations: { [key: string]: object } = {};

  /**
   * Search is processing
   */
  isLoading = false;

  /**
   * Indicates if the component is included in angular routes
   */
  inRouting = false;

  /**
   * Current filters applied
   */
  aggFilters = [];

  /**
   * Check if record can be added
   */
  addStatus: ActionStatus = {
    can: true,
    message: ''
  };

  /**
   * Error message
   */
  error: string = null;

  /**
   * Define the current record's page
   */
  @Input()
  page = 1;

  /**
   * Define the number of records per page
   */
  @Input()
  size = 10;

  /**
   * Search query
   */
  @Input()
  q = '';

  /**
   * Admin mode (edit, remove, add, ...)
   */
  @Input()
  adminMode = true;

  /**
   * Types of resources available
   */
  @Input()
  types: {
    key: string,
    label: string,
    component?: Component,
    total?: number,
    canAdd?: any,
    canUpdate?: any,
    canDelete?: any,
    canRead?: any,
    aggregations?: any
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * Url prefix for component routes
   */
  @Input()
  linkPrefix = '';

  /**
   * URL to notice detail
   */
  @Input()
  detailUrl: string = null;

  /**
   * Display search input
   */
  @Input()
  showSearchInput = true;

  /**
   * Current selected resource type
   */
  @Input()
  currentType = 'documents';

  /**
   * Used only for binding with pagination.
   * Avoid side effect if "page" property is bound to pagination
   * (infinite calls to get records).
   * @param page - number, new page
   */
  set currentPage(page: number) {
    this.page = +page;
    this.getRecords(false);
  }

  get currentPage() {
    return this.page;
  }

  /**
   * Store configuration for type
   */
  private config: any;

  /**
   * Constructor
   * @param dialogService - Modal component
   * @param recordService - Service for managing records
   * @param toastService - Toast message
   * @param route - Angular current route
   * @param router - Angular router
   */
  constructor(
    private recordService: RecordService,
    private recordUiService: RecordUiService,
    private route: ActivatedRoute,
    protected router: Router
  ) { }

  /**
   * Component initialisation.
   */
  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      this.loadData();
    });
  }

  /** Load data from routing data.
   *
   * Only relevant when component is loaded into routing
   */
  loadData() {
    const data = this.route.snapshot.data;
    if (data.linkPrefix) {
      this.inRouting = true;
      this.linkPrefix = data.linkPrefix;
    }

    if (data.types) {
      this.types = data.types;
    }

    if (typeof data.showSearchInput !== 'undefined') {
      this.showSearchInput = data.showSearchInput;
    }

    if (typeof data.adminMode !== 'undefined') {
      this.adminMode = data.adminMode;
    }

    if (data.detailUrl) {
      this.detailUrl = data.detailUrl;
    }

    if (this.inRouting === true) {
      this.currentType = this.route.snapshot.paramMap.get('type');

      const queryParams = this.route.snapshot.queryParams;

      for (const key in queryParams) {
        if (['q', 'page', 'size'].includes(key)) {
          this[key] = queryParams[key];
        } else {
          if (Array.isArray(queryParams[key]) === false) {
            this.aggFilters.push({ key, values: [queryParams[key]] });
          } else {
            this.aggFilters.push({ key, values: queryParams[key] });
          }
        }
      }
    }

    this.config = this.recordUiService.getResourceConfig(this.types, this.currentType);

    this.getRecords(this.inRouting === false);

    for (const type of this.types) {
      this.recordService.getRecords(type.key, '', 1, 1, [], this.config.preFilters || {}).subscribe(records => {
        type.total = records.hits.total;
      });
    }

    this.checkAddActionStatus().subscribe((result: ActionStatus) => {
      this.addStatus = result;
    });
  }

  /**
   * Store or remove facet filter.
   * @param event - object, containing term and selected values
   */
  public updateAggregationFilter(event: { term: string, values: string[] }) {
    const term = event.term;
    const values = event.values;

    const index = this.aggFilters.findIndex(item => item.key === term);

    if (index !== -1) {
      this.aggFilters[index] = { key: term, values };
    } else {
      this.aggFilters.push({ key: term, values });
    }

    this.getRecords();
  }

  /**
   * Change number of items per page value.
   * @param event - Event, dom event triggered
   * @param size - number, new page size
   */
  public changeSize(event: Event, size: number) {
    event.preventDefault();
    this.size = size;
    this.getRecords();
  }

  /**
   * Change query text.
   * @param event - string, new query text
   */
  public searchByQuery(event: string) {
    this.q = event;
    this.getRecords();
  }

  /**
   * Change type of records.
   * @param event - Event, dom event triggered
   * @param type - string, type of resource
   */
  public changeType(event: Event, type: string) {
    event.preventDefault();
    this.currentType = type;
    this.aggFilters = [];
    this.config = this.recordUiService.getResourceConfig(this.types, this.currentType);
    this.getRecords();

    this.checkAddActionStatus().subscribe((result: ActionStatus) => {
      this.addStatus = result;
    });
  }

  /**
   * Get current selected values for filter
   * @param term - string, aggregation filter key
   */
  public getFilterSelectedValues(term: string) {
    const index = this.aggFilters.findIndex(item => item.key === term);

    if (index !== -1) {
      return this.aggFilters[index].values;
    }

    return [];
  }

  /**
   * Check if pagination have to be displayed
   */
  public showPagination() {
    return this.total > this.size;
  }

  /**
   * Delete a record by its PID.
   * @param pid - string, PID to delete
   */
  public deleteRecord(pid: string) {
    this.recordUiService.deleteRecord(pid, this.currentType).subscribe((result) => {
      if (result === true) {
        // refresh records
        this.getRecords(false);

        // update main counter
        this.config.total--;
      }
    });
  }

  /**
   * Get component view for the current resource type.
   */
  public getResultItemComponentView() {
    if (this.config.component) {
      return this.config.component;
    }
    return null;
  }

  /**
   * Check if a record can be added
   */
  public checkAddActionStatus(): Observable<ActionStatus> {
    if (this.config.canAdd) {
      return this.config.canAdd().pipe(first());
    }

    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   */
  public canUpdateRecord(record: object): Observable<ActionStatus> {
    if (this.config.canUpdate) {
      return this.config.canUpdate(record);
    }

    return of({ can: true, message: '' });
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   */
  public canDeleteRecord(record: object): Observable<ActionStatus> {
    if (this.config.canDelete) {
      return this.config.canDelete(record);
    }

    return of({ can: true, message: '' });
  }

  /**
   * Search for records.
   * @param resetPage - boolean, if page needs to be resetted to 1.
   */
  private getRecords(resetPage: boolean = true) {
    if (resetPage === true) {
      this.page = 1;
    }

    this.updateRoute();

    this.isLoading = true;

    this.recordService.getRecords(
      this.currentType,
      this.q,
      this.page,
      this.size,
      this.aggFilters,
      this.config.preFilters || {}
    ).subscribe(
      records => {
        this.records = records.hits.hits;
        this.total = records.hits.total;
        this.aggregationsFilters(records.aggregations).subscribe((aggr: any) => {
          this.aggregations = aggr;
        });
        this.isLoading = false;
      },
      (error) => {
        this.error = error;
        this.isLoading = false;
      }
    );
  }

  /**
   * Aggregations filters (facets)
   * @param records - Result records
   */
  aggregationsFilters(aggregations: object) {
    if (this.config.aggregations) {
      return this.config.aggregations(aggregations);
    } else {
      return of(aggregations);
    }
  }

  /**
   * Show or hide facet section
   * @param key facet key
   */
  expandFacet(key: string) {
    if ('_settings' in this.aggregations) {
      const settings = this.aggregations._settings;
      const keyExtand = 'expand';
      if (keyExtand in settings && settings[keyExtand].indexOf(key) > -1) {
        return true;
      }
      return false;
    }
    return true;
  }

  /**
   * Update route parameters when search criteria are changed.
   * Only applied if component is integrated in routing.
   */
  private updateRoute() {
    if (this.inRouting === false) {
      return;
    }

    const queryParams = {
      size: this.size,
      page: this.page,
      q: this.q
    };

    const filters = {};
    for (const filter of this.aggFilters) {
      filters[filter.key] = filter.values;
    }

    Object.keys(filters).map(key => queryParams[key] = filters[key]);

    this.router.navigate([this.linkPrefix + '/' + this.currentType], { queryParams });
  }

  /**
   * Returns an observable which emits the URL value for given record.
   * In case record cannot be read, returns null.
   * @param record - Generate detail URL for this record.
   */
  resolveDetailUrl(record: any): Observable<any> {
    const url = { link: `detail/${record.metadata.pid}`, external: false };

    if (this.detailUrl) {
      url.link = this.detailUrl.replace(':type', this.currentType).replace(':pid', record.metadata.pid);
      url.external = true;
    }

    if (!this.config.canRead) {
      return of(url);
    }

    return this.config.canRead(record).pipe(
      map((status: ActionStatus) => {
        if (status.can === false) {
          return null;
        }

        return url;
      })
    );
  }
}
