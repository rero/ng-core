// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IQueryOptions, IRemoteAutocomplete, ISuggestionItem } from './remote-autocomplete.interface';

// Override this service in your application to implement your logic

@Injectable({
  providedIn: 'root',
})
export class RemoteAutocompleteService implements IRemoteAutocomplete {
  public getSuggestions(
    _query: string,
    _queryOptions: IQueryOptions,
    _currentPid: string | null,
  ): Observable<ISuggestionItem[]> {
    return of([{ label: 'test' }]);
  }

  getValueAsHTML(_queryOptions: IQueryOptions, item: ISuggestionItem): Observable<string> {
    return of(item.label);
  }
}
