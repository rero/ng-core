/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
 * Copyright (C) 2022 UCLouvain
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
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Button } from 'primeng/button';
import { DataView } from 'primeng/dataview';
import { Message } from 'primeng/message';
import { ToggleSwitch, ToggleSwitchChangeEvent } from 'primeng/toggleswitch';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ErrorComponent, SearchInputComponent, UpperCaseFirstPipe } from '../../../../core';
import { Aggregations, SearchField, SearchFilter, SearchFilterSection } from '../../../../model';
import { ActionStatus } from '../../../../model/action-status.interface';
import { ExportFormat } from '../../../model/record-search.interface';
import { ApiService } from '../../../service/api/api.service';
import { RecordUiService } from '../../../service/record-ui/record-ui.service';
import { RecordService } from '../../../service/record/record.service';
import { AggregationsFilter } from '../model/aggregations-filter.interface';
import { RecordSearchStore } from '../store/record-search.store';
import { RecordSearchAggregationComponent } from './aggregation/aggregation.component';
import { ListFiltersComponent } from './aggregation/list-filters/list-filters.component';
import { ExportButtonComponent, IExportOption } from './export-button/export-button.component';
import { MenuSortComponent } from './menu-sort/menu-sort.component';
import { PaginatorComponent } from './paginator/paginator.component';
import { RecordSearchResultComponent } from './record-search-result/record-search-result.component';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { SearchTabsComponent } from './search-tabs/search-tabs.component';

@Component({
  selector: 'ng-core-record-search',
  templateUrl: './record-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ErrorComponent,
    SearchTabsComponent,
    SearchInputComponent,
    Message,
    Button,
    RouterLink,
    MenuSortComponent,
    ExportButtonComponent,
    ListFiltersComponent,
    ToggleSwitch,
    SearchFiltersComponent,
    RecordSearchAggregationComponent,
    DataView,
    RecordSearchResultComponent,
    PaginatorComponent,
    TranslatePipe,
    UpperCaseFirstPipe,
    CommonModule,
  ],
})
export class RecordSearchComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected recordService: RecordService = inject(RecordService);
  protected recordUiService: RecordUiService = inject(RecordUiService);
  protected translateService: TranslateService = inject(TranslateService);
  protected spinner: NgxSpinnerService = inject(NgxSpinnerService);
  protected apiService: ApiService = inject(ApiService);
  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  // this is inherited from the parent component
  protected readonly elementRef = inject(ElementRef);
  readonly store = inject(RecordSearchStore);

  // COMPONENT ATTRIBUTES =====================================================
  /** If admin mode is disabled, no action can be performed on a record (as add, update or remove) */
  // this cannot be done in the store because we want to let it as pure
  readonly adminMode = computed(() => this.store.routeConfig().adminMode);

  // Convert observables to signals directly - more efficient than manual subscriptions
  readonly addStatus: Signal<ActionStatus> = toSignal(this.store.canAddRecord$(), {
    initialValue: { can: false, message: '' },
  });

  /** If we need to show the empty search message info. */
  showEmptySearchMessage = computed(() => this.store.config().allowEmptySearch === false && !this.store.q());

  /** Define if title have to be displayed or not. */
  readonly _showLabel = input(true);

  availableTypes = computed(() => this.store.configs().filter((item) => item.hideInTabs !== true));

  /**
   * Get Export formats for the current resource given by configuration.
   * @return Array of export format to generate an `export as` button or an empty array.
   */
  exportFormats = computed((): IExportOption[] =>
    this.store.config().exportFormats.map((format) => {
      return {
        label: format.label,
        url: this.getExportFormatUrl(format),
        disabled: !this.canExport(format),
        disabled_message: this.exportInfoMessage(),
      };
    }),
  );

  /** Get showLabel value, given either by config or by local value. */
  showLabel = computed(() => {
    if (this.config().showLabel != null) {
      return this.config().showLabel;
    }
    return this._showLabel();
  });

  /** Config getter for backward compatibility */
  config = computed(() => this.store.config());

  /**
   * Check if the current type has no record.
   * @returns True if no record is found and no search query is done.
   */
  get hasNoRecord(): boolean {
    return this.config().showFacetsIfNoResults
      ? false
      : !this.store.q() && this.store.hits().length === 0 && !this.showEmptySearchMessage;
  }

  /** Return a message containing the reasons why record list cannot be exported. */
  exportInfoMessage = computed(() =>
    this.store.total() === 0
      ? this.translateService.instant('Result list is empty.')
      : this.translateService.instant('Too many items. Should be less than {{max}}.', {
          max: RecordService.MAX_REST_RESULTS_SIZE,
        }),
  );

  constructor() {
    effect(() => {
      if (this.store.isLoading()) {
        this.spinner.show();
      } else {
        this.spinner.hide();
      }
    });
  }

  // COMPONENT FUNCTIONS ======================================================

  /**
   * Change query text.
   * @param event - string, new query text
   */
  searchByQuery(event: string) {
    this.store.updateQuery(event);
  }

  /**
   * Delete a record by its PID.
   * @param event - object
   */
  deleteRecord(event: { pid: string; type?: string }) {
    const type = event.type ?? this.store.currentType();
    const deleteMessage = this.recordUiService.deleteMessage(event.pid, this.store.config());
    this.recordUiService
      .deleteRecord(type, event.pid, deleteMessage)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          this.store.updatePage(1);
          // Force reload of results after deletion
          // TODO: force reload event if no params has changed
          this.store.fetchRecords({
            index: this.store.currentIndex(),
            query: this.store.q(),
            page: this.store.page(),
            allowEmptySearch: this.store.config().allowEmptySearch,
            itemsPerPage: this.store.size(),
            aggregationsFilters: this.store.aggregationsFilters(),
            preFilters: this.store.config().preFilters,
            sort: this.store.activeSort(),
            facets: this.store.facetsParameter(),
            headers: this.store.config().listHeaders,
          });
        }),
      )
      .subscribe();
  }

  /**
   * Show a modal containing message given in parameter.
   * @param message - message to display into modal
   */
  showDeleteMessage(message: string): void {
    this.recordUiService.showDeleteMessage(message);
  }

  /**
   * Get component view for the current resource type.
   * @return A component for displaying result item.
   */
  getResultItemComponentView() {
    return this.config().component ? this.config().component : null;
  }

  /**
   * Get export format url.
   * @param format - export format object
   * @return formatted url for an export format.
   */
  getExportFormatUrl(format: ExportFormat): string {
    const queryParams = Object.keys(this.activatedRoute.snapshot.queryParams);
    // TODO: maybe we can use URLSerializer to build query string
    const baseUrl = format.endpoint ? format.endpoint : this.apiService.getEndpointByType(this.store.currentIndex());
    let url = `${baseUrl}?q=${encodeURIComponent(this.store.q())}&format=${format.format}`;

    // check if max rest result size is disabled
    if (!format.disableMaxRestResultsSize) {
      url += `&size=${RecordService.MAX_REST_RESULTS_SIZE}`;
    }
    // preFilters
    if (this.config().preFilters) {
      for (const [key, value] of Object.entries(this.store.config().preFilters)) {
        // force value to an array
        const values = !Array.isArray(value) ? [value] : value;
        values.map((v) => {
          // We check whether the parameter exists in the current url.
          // If it does, we don't add the preFilter parameter.
          if (!queryParams.includes(key)) {
            url += `&${key}=${v}`;
          }
        });
      }
    }
    // aggregations
    if (this.store.aggregationsFilters()) {
      this.store.aggregationsFilters().map((filter) => {
        filter.values.map((v) => {
          url += `&${filter.key}=${v}`;
        });
      });
    }
    return url;
  }

  /**
   * Check if a record list can be exported
   * @param format - export format object
   * @return Boolean
   */
  canExport(format: ExportFormat): boolean {
    return Object.hasOwn(format, 'disableMaxRestResultsSize') && format.disableMaxRestResultsSize
      ? this.store.total() > 0
      : 0 < this.store.total() && this.store.total() < RecordService.MAX_REST_RESULTS_SIZE;
  }

  /**
   * Filter the aggregations with given configuration function.
   * If no configuration is given, return the original aggregations.
   * @param records - Result records
   * @return Observable containing aggregations corresponding to actual records.
   */
  aggregations$(aggregations: Aggregations): Observable<Aggregations> {
    return of(aggregations);
  }

  searchInField(event: ToggleSwitchChangeEvent, path: string): void {
    this.store.updateSearchFields(
      this.store.config().searchFields.map((item: SearchField) => {
        if (item.path === path) {
          item.selected = event.checked;
        }
        return item;
      }),
    );
    // If query string is specified, search is processed.
    const q = this.store.q();
    if (q) {
      this.searchByQuery(q);
    }
  }

  /**
   * Extract persistent search filters on current url
   * @return Array of aggregations filter
   */
  protected _extractPersistentAggregationsFilters(): AggregationsFilter[] {
    const persistent: AggregationsFilter[] = [];
    this._flatSearchFilters()
      .filter((filter) => filter.persistent === true)
      .forEach((filter: SearchFilter) => {
        if (Object.hasOwn(this.activatedRoute.snapshot.queryParams, filter.filter)) {
          const data = this.activatedRoute.snapshot.queryParams[filter.filter];
          persistent.push({
            key: filter.filter,
            values: Array.isArray(data) ? data : [data],
          });
        }
      });
    return persistent;
  }

  /**
   * Make all search filters on same array level
   * @returns - A filters array
   */
  protected _flatSearchFilters(): SearchFilter[] {
    const flatFilters: SearchFilter[] = [];
    this.store.config().searchFilters.forEach((searchFilter: any) => {
      if (searchFilter.filters) {
        searchFilter.filters.forEach((filter: any) => flatFilters.push(filter));
      } else {
        flatFilters.push(searchFilter);
      }
    });
    return flatFilters;
  }

  scrollToTop(): void {
    this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
