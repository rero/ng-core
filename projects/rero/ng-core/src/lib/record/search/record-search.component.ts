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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { JSONSchema7 } from 'json-schema';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionStatus } from '../action-status';
import { RecordUiService } from '../record-ui.service';
import { RecordService } from '../record.service';
import { RecordSearchService, AggregationsFilter } from './record-search.service';

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
  aggregations: Array<{ key: string, bucketSize: any, value: { buckets: [] } }>;

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
   * Defined the sort order
   */
  @Input()
  sort: string = null;

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
  // @Input()
  // inRouting = false;

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
    itemHeaders?: any,
    aggregationsOrder?: Array<string>,
    aggregationsExpand?: Array<string>,
    aggregationsBucketSize?: number,
    showSearchInput?: boolean,
    pagination?: {
      boundaryLinks?: boolean,
      maxSize?: number
    },
    formFieldMap?: (field: FormlyFieldConfig, jsonSchema: JSONSchema7) => FormlyFieldConfig
  }[] = [{ key: 'documents', label: 'Documents' }];

  /**
   * URL to notice detail
   */
  @Input()
  detailUrl: string = null;

  /**
   * Display search input
   */
  _showSearchInput = true;
  @Input()
  set showSearchInput(value) {
    if (value != null) {
      this._showSearchInput = value;
    }
  }
  get showSearchInput() {
    const config = this.recordUiService.getResourceConfig(this.currentType);
    // at the type level
    if (config.showSearchInput != null) {
      return config.showSearchInput;
    }
    // route level
    return this._showSearchInput;
  }

  /**
   * Current selected resource type
   */
  @Input()
  currentType: string = null;

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
    this._getRecords(false);
  }

  get currentPage() {
    return this.page;
  }

  /**
   * Activate the first and last button on pagnination
   * @return boolean
   */
  get paginationBoundaryLinks() {
    const paginationConfig = this.getResourceConfig('pagination', {});
    return ('boundaryLinks' in paginationConfig) ? paginationConfig.boundaryLinks : false;
  }

  /**
   * Number of pages showed on pagination
   * @return number
   */
  get paginationMaxSize() {
    const paginationConfig = this.getResourceConfig('pagination', {});
    return ('maxSize' in paginationConfig) ? paginationConfig.maxSize : 5;
  }

  /**
   * Constructor
   * @param dialogService - Modal component
   * @param recordService - Service for managing records
   * @param toastService - Toast message
   */
  constructor(
    private recordService: RecordService,
    private recordUiService: RecordUiService,
    private _recordSearchService: RecordSearchService
  ) { }

  /**
   * Component initialisation.
   */
  ngOnInit() {
    // Subscribe on aggregation filters changes and do search.
    // this._recordSearchService.aggregationsFilters.subscribe((aggregationsFilters: Array<AggregationsFilter>) => {
    //   this.aggFilters = aggregationsFilters;
    //   this._getRecords(false);
    // });

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
    console.log(changes, this);

    if (changes.aggFilters && changes.aggFilters.firstChange) {
      // store types in record service for next processings.
      // TODO: Try to set types directly in RecordUiService using route events.
      this.recordUiService.types = this.types;
      this.loadConfigurationForType(this.currentType);
      this._getRecords(false);
      return;
    }

    if (changes.page) {
      console.log('Page', changes.page, this.page);
    }

    if (changes.currentType && changes.currentType.currentValue !== this.currentType) {
      this.loadConfigurationForType(this.currentType);
      this.aggFilters = [];
      this._recordSearchService.setAggregationsFilters(this.aggFilters);
      this._getRecords(changes.page && changes.page.currentValue !== this.page);
    }

    // if (changes.aggFilters) {
    //   this._recordSearchService.setAggregationsFilters(changes.aggFilters.currentValue);
    // }

    const params = ['q', 'page', 'size', 'sort'];
    let changed = false;
    params.forEach((param) => {
      if (changes[param] && changes[param].currentValue !== this[param]) {
        changed = true;
      }
    });

    if (changed) {
      this._getRecords(changes.page && changes.page.currentValue !== this.page);
    }
  }

  /**
   * Change number of items per page value.
   * @param event - Event, dom event triggered
   * @param size - number, new page size
   */
  changeSize(event: Event, size: number) {
    event.preventDefault();
    this.size = size;
    this._getRecords();
  }

  /**
   * Change query text.
   * @param event - string, new query text
   */
  searchByQuery(event: string) {
    this.q = event;
    this._getRecords();
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
    this._recordSearchService.setAggregationsFilters(this.aggFilters);
    this._getRecords();
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
    this.recordUiService.deleteRecord(this.currentType, pid).subscribe((result) => {
      if (result === true) {
        // refresh records
        this._getRecords(true, false);

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
   * @param resetPage If page needs to be resetted to 1.
   * @param emitParameters If parameters have to be emitted in parents.
   */
  private _getRecords(resetPage: boolean = true, emitParameters: boolean = true) {
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
      this.config.listHeaders || null,
      this.sort
    ).subscribe(
      records => {
        this.records = records.hits.hits;
        this.total = records.hits.total;
        this.aggregationsFilters(records.aggregations).subscribe((aggr: any) => {
          this.aggregations = this.aggregationsOrder(aggr);
        });

        this.isLoading = false;

        if (emitParameters) {
          this.emitNewParameters();
        }
      },
      (error) => {
        this.error = error;
        this.isLoading = false;
      }
    );
  }

  /**
   * Aggregations order (facets)
   * @param aggr - Aggregations dictonary
   */
  aggregationsOrder(aggr: any) {
    // TODO: replace 'value' by buckets directly and merge and rename aggregationOrders and aggregationsFilters
    // to postProcessAggregations in route configuration
    const aggregations = [];
    const bucketSize = ('aggregationsBucketSize' in this.config) ? this.config.aggregationsBucketSize : null;
    if ('aggregationsOrder' in this.config) {
      this.config.aggregationsOrder.forEach((key: string) => {
        if (key in aggr) {
          aggregations.push({ key, bucketSize, value: { buckets: aggr[key].buckets } });
        }
      });
    } else {
      Object.keys(aggr).forEach((key: string) => {
        aggregations.push({ key, bucketSize, value: { buckets: aggr[key].buckets } });
      });
    }
    return aggregations;
  }

  /**
   * Filter the aggregations with given configuration function.
   * If no configuration is given, return the original aggregations.
   * @param records - Result records
   */
  aggregationsFilters(aggregations: object): Observable<any> {
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
    const config = this.recordUiService.getResourceConfig(this.currentType);
    const expandConfig = ('aggregationsExpand' in config) ? config.aggregationsExpand : [];
    if (expandConfig.indexOf(key) === -1) {
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
    // if (this.inRouting === false && !this.detailUrl) {
    if (!this.detailUrl) {
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
      aggFilters: this.aggFilters,
      sort: this.sort
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

    if (simpleChanges[key].currentValue !== simpleChanges[key].previousValue) {
      return true;
    }

    return false;
  }

  /**
   * Get Resource config
   * @param paramName - Name of parameter
   * @param defaultValue - Default value is returned if the parameter is not defined
   */
  private getResourceConfig(paramName: string, defaultValue: any) {
    const config = this.recordUiService.getResourceConfig(this.currentType);
    return (paramName in config) ? config[paramName] : defaultValue;
  }
}
