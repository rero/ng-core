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
import { Observable, of } from "rxjs";
import { IQueryOptions, IRemoteAutocomplete, ISuggestionItem } from "./remote-autocomplete.interface";

// Override this service in your application to implement your logic

@Injectable({
  providedIn: 'root'
})
export class RemoteAutocompleteService implements IRemoteAutocomplete {

  public getSuggestions(query: string, queryOptions: IQueryOptions, currentPid: string): Observable<ISuggestionItem[]> {
    return of([]);

  }

  getValueAsHTML(queryOptions: IQueryOptions, item: ISuggestionItem): Observable<string> {
    return of(item.label);
  }
}
