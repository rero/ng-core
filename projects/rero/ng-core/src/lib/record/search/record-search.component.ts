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
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { of, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RecordService } from '../record.service';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';

@Component({
  selector: 'ng-core-record-search',
  templateUrl: './record-search.component.html',
  styles: []
})
export class RecordSearchComponent implements OnInit, OnChanges {
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
   * Store configuration for type
   */
  private config: any;

  /**
   * Current filters applied
   */
  @Input()
  aggFilters = [];

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
   * Component is integrated in angular routing
   */
  @Input()
  inRouting = false;

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
    aggregations?: any,
    listHeaders?: any,
    itemHeaders?: any
  }[] = [{ key: 'documents', label: 'Documents' }];

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
   * Output current state when parameters change.
   */
  @Output() parametersChanged = new EventEmitter<any>();

  /**
   * Used only for binding with pagination.
   * Avoid side effect if "page" property is bound to pagination
   * (infinite calls to get records).
   * @param page - number, new page
   */
  set currentPage(page: number) {
    this.page = +page;
    this.getRecords(false);
    this.emitNewParameters();
  }

  get currentPage() {
    return this.page;
  }

  /**
   * Constructor
   * @param dialogService - Modal component
   * @param recordService - Service for managing records
   * @param toastService - Toast message
   */
  constructor(
    private recordService: RecordService,
    private recordUiService: RecordUiService
  ) { }

  /**
   * Component initialisation.
   */
  ngOnInit() {
    // Load totals for each resource type
    for (const type of this.types) {
      this.recordService.getRecords(
        type.key, '', 1, 1, [],
        this.config.preFilters || {},
        this.config.listHeaders || null).subscribe(records => {
        type.total = records.hits.total;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // store types in record service for next processings.
    // TODO: Try to set types directly in RecordUiService using route events.
    this.recordUiService.types = this.types;

    // load configuration corresponding to current type
    if (this.isParamChanged('currentType', changes) === true) {
      this.loadConfigurationForType(this.currentType);
    }

    // Get records
    if (this.hasChangedParams(changes) === true) {
      this.getRecords(false);
    }
  }

  /**
   * Store or remove facet filter.
   * @param event - object, containing term and selected values
   */
  updateAggregationFilter(event: { term: string, values: string[] }) {
    const term = event.term;
    const values = event.values;
    const index = this.aggFilters.findIndex(item => item.key === term);

    // no more items selected, remove filter
    if (values.length === 0) {
      this.aggFilters.splice(index, 1);
    } else {
      if (index !== -1) {
        this.aggFilters[index] = { key: term, values };
      } else {
        this.aggFilters.push({ key: term, values });
      }
    }

    this.getRecords();
    this.emitNewParameters();
  }

  /**
   * Change number of items per page value.
   * @param event - Event, dom event triggered
   * @param size - number, new page size
   */
  changeSize(event: Event, size: number) {
    event.preventDefault();
    this.size = size;
    this.getRecords();
    this.emitNewParameters();
  }

  /**
   * Change query text.
   * @param event - string, new query text
   */
  searchByQuery(event: string) {
    this.q = event;
    this.getRecords();
    this.emitNewParameters();
  }

  /**
   * Change type of records.
   * @param event - Event, dom event triggered
   * @param type - string, type of resource
   */
  changeType(event: Event, type: string) {
    event.preventDefault();
    this.currentType = type;
    this.aggFilters = [];
    this.getRecords();
    this.emitNewParameters();
    this.loadConfigurationForType(type);
  }

  /**
   * Get current selected values for filter
   * @param term - string, aggregation filter key
   */
  getFilterSelectedValues(term: string) {
    const index = this.aggFilters.findIndex(item => item.key === term);

    if (index !== -1) {
      return this.aggFilters[index].values;
    }

    return [];
  }

  /**
   * Check if pagination have to be displayed
   */
  showPagination() {
    return this.total > this.size;
  }

  /**
   * Delete a record by its PID.
   * @param pid - string, PID to delete
   */
  deleteRecord(pid: string) {
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
  getResultItemComponentView() {
    if (this.config.component) {
      return this.config.component;
    }
    return null;
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   */
  canUpdateRecord$(record: object): Observable<ActionStatus> {
    return this.recordUiService.canUpdateRecord$(record, this.currentType);
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   */
  canDeleteRecord$(record: object): Observable<ActionStatus> {
    return this.recordUiService.canDeleteRecord$(record, this.currentType);
  }

  /**
   * Search for records.
   * @param resetPage - boolean, if page needs to be resetted to 1.
   */
  private getRecords(resetPage: boolean = true) {
    if (resetPage === true) {
      this.page = 1;
    }

    this.isLoading = true;

    this.recordService.getRecords(
      this.currentType,
      this.q,
      this.page,
      this.size,
      this.aggFilters,
      this.config.preFilters || {},
      this.config.listHeaders || null
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
      const keyExpand = 'expand';
      if (keyExpand in settings && settings[keyExpand].indexOf(key) > -1) {
        return true;
      }
      return false;
    }
    return true;
  }

  /**
   * Returns an observable which emits the URL value for given record.
   * In case record cannot be read, returns null.
   * @param record - Generate detail URL for this record.
   */
  resolveDetailUrl(record: any): Observable<any> {
    if (this.inRouting === false && !this.detailUrl) {
      return of(null);
    }

    const url = { link: `detail/${record.metadata.pid}`, external: false };

    if (this.detailUrl) {
      url.link = this.detailUrl.replace(':type', this.currentType).replace(':pid', record.metadata.pid);
      url.external = true;
    }

    if (!this.config.canRead) {
      return of(url);
    }

    return this.recordUiService.canReadRecord$(record, this.currentType).pipe(
      map((status: ActionStatus) => {
        if (status.can === false) {
          return null;
        }

        return url;
      })
    );
  }

  /**
   * Emit new parameters when a change appends.
   */
  private emitNewParameters() {
    this.parametersChanged.emit({
      q: this.q,
      page: this.page,
      size: this.size,
      currentType: this.currentType,
      aggFilters: this.aggFilters
    });
  }

  /**
   * Get configuration for the current resource type.
   * @param type Type of resource
   */
  private loadConfigurationForType(type: string) {
    this.config = this.recordUiService.getResourceConfig(type);
    this.recordUiService.canAddRecord$(type).subscribe((result: ActionStatus) => {
      this.addStatus = result;
    });
  }

  /**
   * Check if query params or type have changed.
   * @param simpleChanges Object containing changes
   */
  private hasChangedParams(simpleChanges: SimpleChanges) {
    const params = ['currentType', 'q', 'size', 'page', 'aggFilters'];

    for (const key of params) {
      if (this.isParamChanged(key, simpleChanges) === true) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if parameter given by key has changed.
   * @param simpleChanges Object containing changes
   */
  private isParamChanged(key: string, simpleChanges: SimpleChanges) {
    if (!simpleChanges[key]) {
      return false;
    }

    if (simpleChanges[key].firstChange === true) {
      return true;
    }

    if (simpleChanges[key].currentValue !== this[key]) {
      return true;
    }

    return false;
  }
}
