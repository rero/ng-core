// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Observable } from 'rxjs';

export interface IRemoteAutocomplete {
  getSuggestions(query: string, queryOptions: IQueryOptions, currentPid: string | null): Observable<ISuggestionItem[]>;
  getValueAsHTML(queryOptions: IQueryOptions, item: ISuggestionItem): Observable<string>;
}

export interface IQueryOptions {
  allowAdd?: boolean;
  field?: string;
  filter?: string;
  isNotRef?: boolean;
  label?: string;
  maxLengthSuggestion?: number;
  maxOfResult?: number;
  suggest?: string;
  type?: string;
}

export interface ISuggestionItem {
  label: string;
  value?: string;
  summary?: string;
  link?: string;
}

export interface IRemoteAutoCompleteFilter {
  selected: string;
  options: Observable<ISuggestionItem[]>;
}

export interface IQuery {
  query: string;
  queryOptions: IQueryOptions;
  recordPid: string | null;
}

export interface IValueSelect {
  item: ISuggestionItem;
  queryOptions: IQueryOptions;
}
