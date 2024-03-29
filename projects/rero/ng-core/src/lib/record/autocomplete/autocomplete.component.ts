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
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { combineLatest, Observable, of, Subscriber } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RecordService } from '../record.service';

@Component({
  selector: 'ng-core-autocomplete',
  templateUrl: './autocomplete.component.html'
})
export class AutocompleteComponent implements OnInit {
  // The submit button css class.
  @Input() buttonCssClass = 'btn btn-light';

  // The form action i.e. '/search'
  @Input() action: string;

  // The autocomplete record type configuration.
  @Input() recordTypes: Array<any> = [];

  // The search input field size: small or large
  @Input() size: string;

  // The search input field placeholder.
  @Input() placeholder: string;

  // The routing mode, angular for internal or href for external.
  @Input() internalRouting = true;

  // The minimal number of characters that needs to be entered before typeahead kicks-in.
  @Input() typeaheadMinLength = 3;

  // The minimal wait time after last character typed before typeahead kicks-in.
  @Input() typeaheadWaitMs = 300;

  // The maximum length of the total number of suggestions in the list. The default value is 10.
  @Input() typeaheadOptionsLimit = 10;

  // Additional query parameters
  @Input() extraQueryParams = { page: '1', size: '10' };

  // The current selected suggestion.
  asyncSelected = {
    text: undefined,
    query: undefined,
    index: undefined,
    category: undefined,
    href: undefined
  };

  // The remote suggestions loading status.
  typeaheadLoading: boolean;

  // The remote suggestions list.
  dataSource: Observable<any>;

  // The current form object from the template.
  @ViewChild('form')
  form: any;

  // The suggestion list subscriber, used to close the dropdown
  suggestions$: Subscriber<object>;
  /**
   * Constructor.
   *
   * @param recordService - REST API record service
   * @param route - Angular current route
   * @param router - Angular router for navigation
   */
  constructor(
    private recordService: RecordService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  /**
   * On init hook
   */
  ngOnInit() {
    this.route.queryParamMap.subscribe((params: any) => {
      if (this.action === this.router.url.split('?')[0]) {
        // get the query form the URL
        const query = params.get('q');
        if (query) {
          this.asyncSelected = {
            query,
            text: query,
            index: undefined,
            category: undefined,
            href: undefined
          };
        }
      }
      this.dataSource = new Observable((suggestions$: Subscriber<object>) => {
        // Runs on every search
        this.suggestions$ = suggestions$;
        this.suggestions$.next(this.asyncSelected);
      }).pipe(
        switchMap((asyncSelected: any) => {
          if (asyncSelected == null) {
            return of([]);
          }
          return this.getSuggestions(asyncSelected.query);
        }
        )
      );
    });
  }

  /**
   * Apply search action
   * @param event - Event, DOM event
   */
  doSearch(event: any = null) {
    if (event != null) {
      event.preventDefault();
    }
    if (this.internalRouting) {
      this.router.navigate([this.action], {
        queryParams: {
          ...this.extraQueryParams,
          q: this.asyncSelected.query
        }
      });
      // empty the suggestion list to close the dropdown
      this.suggestions$.next(null);
    } else {
      this.form.nativeElement.submit();
    }
  }

  /**
   * Get remote suggestions
   * @param query - string, search query string
   */
  getSuggestions(query: string): Observable<any> {
    // patch non working typeaheadMinLength properties
    if (query.length < this.typeaheadMinLength) {
      return of([]);
    }
    const combineGetRecords = [];
    const recordTypesKeys = this.recordTypes.map(recordType => recordType.type);
    this.recordTypes.forEach(recordType => {
      const queryParams = [];
      // use queryParams only if ES filter does not exist.
      if ('queryParams' in recordType) {
        Object.keys(recordType.queryParams).forEach(key => {
          queryParams.push(`${key}:${recordType.queryParams[key].replace(':', '\\:')}`);
        });
      }
      let queryRecord = `${recordType.field}:${query}`;
      if (queryParams.length > 0) {
        queryRecord += ` AND ${queryParams.join(' AND ')}`;
      }
      combineGetRecords.push(
        this.recordService.getRecords(
          recordType.index ? recordType.index : recordType.type,
          queryRecord,
          1,
          recordType.maxNumberOfSuggestions
            ? recordType.maxNumberOfSuggestions
            : 10,
          [],
          recordType.preFilters ? recordType.preFilters : {}
        )
      );
    });
    return combineLatest(combineGetRecords).pipe(
      map((getRecordsValues: Array<any>) => {
        // add query at the top
        let values = [];
        recordTypesKeys.forEach((recordType, index) => {
          values = values.concat(
            this.recordTypes[index].getSuggestions(
              query,
              getRecordsValues[index]
            )
          );
        });
        return values;
      })
    );
  }

  /**
   * Store the loading state
   * @param e - boolean, true if loading
   */
  changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }

  /**
   * A suggestion is selected
   * @param e - TypeaheadMatch, contains the selected suggestion
   */
  typeaheadOnSelect(e: TypeaheadMatch): void {
    if (e.item.href) {
      if (this.internalRouting) {
        this.router.navigate([e.item.href]);
      } else {
        window.location.href = e.item.href;
      }
    } else {
      this.doSearch();
    }
  }
}
