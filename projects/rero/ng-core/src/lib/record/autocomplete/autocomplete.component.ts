/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { TypeaheadMatch } from 'ngx-bootstrap';
import { combineLatest, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { RecordService } from '../record.service';

@Component({
  selector: 'ng-core-autocomplete',
  templateUrl: './autocomplete.component.html'
})
export class AutocompleteComponent implements OnInit {
  /** The current form object from the template. */
  @ViewChild('form', { static: false }) form;

  /** The current selected suggestion. */
  asyncSelected = {
    text: undefined,
    query: undefined,
    index: undefined,
    category: undefined,
    href: undefined
  };

  /** The submit button css class. */
  @Input() buttonCssClass = 'btn btn-light';

  /** The remote suggestions loading status. */
  typeaheadLoading: boolean;

  /** The remote suggestions list. */
  dataSource: Observable<any>;

  /** The form action i.e. '/search' */
  @Input() action: string;

  /** The autocomplete record type configuration. */
  @Input()
  recordTypes: Array<any> = [];

  /** The search input field size: small or large */
  @Input() size: string;

  /** The search input field placeholder. */
  @Input() placeholder: string;

  /** The routing mode, angular for internal or href for external. */
  @Input() internalRouting = true;

  // debug information
  // @Input() displayScore = undefined;

  /** The minimal number of characters that needs to be entered before typeahead kicks-in. */
  @Input() typeaheadMinLength = 3;

  /** The minimal wait time after last character typed before typeahead kicks-in. */
  @Input() typeaheadWaitMs = 300;

  /** The maximum length of options items list. The default value is 20. */
  @Input() typeaheadOptionsLimit = 10;

  // store a current URL redirection
  private redirect = false;

  /**
   * Constructor
   * @param recordService - REST API record service
   * @param route - Angular current route
   * @param router - Angular router for navigation
   */
  constructor(
    private recordService: RecordService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * On init hook
   */
  ngOnInit() {
    this.route.queryParamMap.subscribe((params: any) => {
      // if (params.get('display_score')) {
      //   this.displayScore = params.get('display_score');
      // }
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
      this.dataSource = new Observable((observer: any) => {
        // Runs on every search
        observer.next(this.asyncSelected);
      }).pipe(
        mergeMap((asyncSelected: any) =>
          this.getSuggestions(asyncSelected.query)
        )
      );
    });
  }

  /**
   * Apply search action
   * @param event - Event, DOM event
   */
  doSearch(event) {
    event.preventDefault();
    if (!this.redirect) {
      if (this.internalRouting) {
        this.router.navigate([this.action], {
          queryParams: { q: this.asyncSelected.query, page: '1', size: '10' }
        });
      } else {
        this.form.nativeElement.submit();
      }
    }
  }

  /**
   * Get remote suggestions
   * @param query - string, search query string
   */
  getSuggestions(query: string): Observable<any> {
    // patch non working typeaheadMinLength properties
    if (query.length < this.typeaheadMinLength) {
      return of(undefined);
    }
    const combineGetRecords = [];
    const recordTypesKeys = this.recordTypes.map(recordType => recordType.type);
    this.recordTypes.forEach(recordType => {
      combineGetRecords.push(
        this.recordService.getRecords(
          recordType.type,
          `${recordType.field}:${query}`,
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
      this.redirect = true;
    }
  }
}
