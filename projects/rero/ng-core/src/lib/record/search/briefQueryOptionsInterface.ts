/*
 * Invenio angular core
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
export interface BriefQueryOptionsInterface {
  /** Resource type */
  type: string;
  /** Query */
  q: string;
  /** Page */
  page: number;
  /** Size of results */
  size: number;
  /** Aggregation filters */
  aggFilters?: any[];
  /** Pre filters */
  preFilters?: {};
  /** Http headers */
  listHeaders?: any[];
  /** Sort result */
  sort?: string;
}
