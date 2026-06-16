// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Injectable } from '@angular/core';
import { IQueryOptions, IRemoteAutocomplete, ISuggestionItem } from '@rero/ng-core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppRemoteAutocompleteService implements IRemoteAutocomplete {
  private data: ISuggestionItem[] = [
    { label: 'House', value: 'house', summary: 'House description' },
    { label: 'Mystery', value: 'mystery' },
  ];

  public getSuggestions(query: string, queryOptions: IQueryOptions = {}): Observable<ISuggestionItem[]> {
    if (!query) {
      return of([]);
    }
    if (query.startsWith('*')) {
      return of(this.processName(queryOptions.filter));
    }

    return of(
      this.processName(queryOptions.filter).filter((element: ISuggestionItem) =>
        element.label.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  }

  getValueAsHTML(queryOptions: IQueryOptions, item: ISuggestionItem): Observable<string> {
    if (!item) {
      return of('');
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
