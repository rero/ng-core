/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { Injectable } from "@angular/core";
import { IQueryOptions, IRemoteAutocomplete, ISuggestionItem } from "@rero/ng-core";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AppRemoteAutocompleteService implements IRemoteAutocomplete {

  private data: ISuggestionItem[] = [
    { label: 'House', value: 'house' , summary: 'House description' },
    { label: 'Mystery', value: 'mystery' },
  ];

  public getSuggestions(query: string, queryOptions: IQueryOptions = {}, currentPid: string): Observable<ISuggestionItem[]> {
    if (!query) {
      return of([]);
    }
    if (query.startsWith('*')) {
      return of(this.processName(queryOptions.filter));
    }

    return of(this.processName(queryOptions.filter).filter((element: ISuggestionItem) =>
      element.label.toLowerCase().includes(query.toLowerCase())
    ));
  }

  getValueAsHTML(queryOptions: IQueryOptions, item: ISuggestionItem): Observable<string> {
    if (!item) {
      return of(undefined);
    }

    let value = item.label;
    if (item.summary) {
      value += '<br><small>' + item.summary + '</small>';
    }

    return of(value);
  }

  private processName(filter?: string): ISuggestionItem[] {
    if (filter) {
      return structuredClone(this.data).map((element: ISuggestionItem) => {
        element.label = `${filter} - ${element.label}`;

        return element;
      });
    } else {
      return this.data;
    }
  }
}
