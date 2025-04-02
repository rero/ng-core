/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
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
import { Observable } from "rxjs";

export interface IRemoteAutocomplete {
  getSuggestions(query: string, queryOptions: IQueryOptions, currentPid: string): Observable<ISuggestionItem[]>;
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
};

export interface ISuggestionItem {
  label: string;
  value?: string,
  summary?: string;
  link?: string;
}

export interface IRemoteAutoCompleteFilter {
  selected: string;
  options: any;
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
