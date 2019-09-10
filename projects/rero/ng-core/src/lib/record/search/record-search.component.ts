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
import { ToastrService } from 'ngx-toastr';

import { RecordService } from '../record.service';
import { DialogService } from '../../dialog/dialog.service';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'invenio-core-record-search',
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
  total: number = 0;

  /**
   * Facets retreived from request result
   */
  aggregations: { [key: string]: object } = {};

  /**
   * Search is processing
   */
  isLoading: boolean = false;

  /**
   * Indicates if the component is included in angular routes
   */
  inRouting: boolean = false;

  /**
   * Current filters applied
   */
  aggFilters = [];

  /**
   * Define the current record's page 
   */
  @Input()
  page: number = 1;

  /**
   * Define the number of records per page
   */
  @Input()
  size: number = 10;

  /**
   * Search query
   */
  @Input()
  q: string = '';

  /**
   * Admin mode (edit, remove, add, ...)
   */
  @Input()
  adminMode: boolean = true;

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
    canDelete?: any
  }[] = [{ key: 'documents', 'label': 'Documents' }];

  /**
   * Url prefix for component routes
   */
  @Input()
  linkPrefix: string = '';

  /**
   * Display search input
   */
  @Input()
  showSearchInput: boolean = true;

  /**
   * Current selected resource type
   */
  @Input()
  currentType: string = 'documents';

  /**
   * Constructor
   * @param dialogService - Modal component
   * @param recordService - Service for managing records
   * @param toastService - Toast message
   * @param route - Angular current route
   * @param router - Angular router
   */
  constructor(
    private dialogService: DialogService,
    private recordService: RecordService,
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private translate: TranslateService,
    protected router: Router
  ) { }

  /**
   * Component initialisation.
   */
  ngOnInit() {
    // Load data from routing data. Only relevant when component is loaded into routing.
    this.route
      .data
      .subscribe(data => {
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
      });

    if (this.inRouting === true) {
      this.route.params
        .pipe(first()) // avoid side effects when type is pushed to route
        .subscribe(
          params => {
            this.currentType = params['type'];
          }
        );

      this.route.queryParams
        .pipe(first()) // avoid side effects when queryParams are pushed to route
        .subscribe(
          params => {
            for (let key in params) {
              if (['q', 'page', 'size'].includes(key)) {
                this[key] = params[key]
              }
              else {
                if (Array.isArray(params[key]) === false) {
                  this.aggFilters.push({ key, values: [params[key]] });
                }
                else {
                  this.aggFilters.push({ key, values: params[key] });
                }
              }
            }
            this.getRecords();
          }
        );
    }
    else {
      this.getRecords();
    }

    for (const key in this.types) {
      this.recordService.getRecords(this.types[key].key).subscribe(records => {
        this.types[key].total = records.hits.total;
      })
    }
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
      this.aggFilters[index] = { key: term, values: values };
    }
    else {
      this.aggFilters.push({ key: term, values: values });
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
    this.getRecords();
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
    this.dialogService.show({
      ignoreBackdropClick: true,
      initialState: {
        title: this.translate.instant('Confirmation'),
        body: this.translate.instant('Do you really want to delete this record ?'),
        confirmButton: true,
        confirmTitleButton: this.translate.instant('Delete'),
        cancelTitleButton: this.translate.instant('Cancel')
      }
    }).subscribe((confirm: boolean) => {
      if (confirm === true) {
        this.isLoading = true;

        this.recordService.delete(this.currentType, pid).subscribe(() => {
          // show success message
          this.toastService.success(this.translate.instant('Record deleted.'));

          // update records list, but wait because records are not indexed instantly
          setTimeout(() => {
            this.getRecords(false);
          }, 1000);

          // update main counter
          const config = this.getResourceConfig(this.currentType);
          config.total--;
        });
      }
    });
  }

  /**
   * Get component view for the current resource type.
   */
  public getResultItemComponentView() {
    const config = this.getResourceConfig(this.currentType);

    if (config.component) {
      return config.component;
    }
    return null;
  }

  /**
   * Check if a record can be added
   */
  public canAddRecord() {
    const config = this.getResourceConfig(this.currentType);

    if (config.canAdd) {
      return config.canAdd();
    }
    return true;
  }

  /**
   * Check if a record can be updated
   * @param record - object, record to check
   */
  public canUpdateRecord(record: object) {
    const config = this.getResourceConfig(this.currentType);

    if (config.canUpdate) {
      return config.canUpdate(record);
    }

    return true;
  }

  /**
   * Check if a record can be deleted
   * @param record - object, record to check
   */
  public canDeleteRecord(record: object) {
    const config = this.getResourceConfig(this.currentType);

    if (config.canDelete) {
      return config.canDelete(record);
    }

    return true;
  }

  /**
   * Get resource configuration for the give resource type.
   * @param type - string, resource type
   */
  private getResourceConfig(type: string) {
    const index = this.types.findIndex(item => item.key === type);

    if (index === -1) {
      throw `Configuration not found for type "${type}"`;
    }

    return this.types[index];
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

    this.recordService.getRecords(this.currentType, this.q, this.page, this.size, this.aggFilters).subscribe(records => {
      this.records = records.hits.hits;
      this.total = records.hits.total;
      this.aggregations = records.aggregations;
      this.isLoading = false;
    })
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

    this.router.navigate([this.linkPrefix + '/' + this.currentType], { queryParams: queryParams });
  }
}
