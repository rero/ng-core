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
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ng-core-search-input',
  templateUrl: './search-input.component.html'
})
export class SearchInputComponent {
  /** The current search input object from the template. */
  @ViewChild('searchinput', { static: false }) input: any;

  /** Search output event emitter */
  @Output() search = new EventEmitter<string>();

  /** Display label */
  @Input() displayLabel = true;

  /** Placeholder */
  @Input() placeholder = 'search';

  /** Value to search */
  @Input() searchText = '';

  /** Set the focus on the input element */
  @Input() set focus(value: boolean) {
    if (value === true) {
      setTimeout(() => this.input.nativeElement.focus());
    }
  }

  /** Remove trailing and leading spaces if true */
  @Input() trimQueryString = true;

  doSearch(searchText: string) {
    if (this.trimQueryString) {
      this.search.emit(searchText.trim());
    } else {
      this.search.emit(searchText);
    }
  }
}
