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

/**
 * Class representing a record set retured by API.
 */
export class Record {
  aggregations: any;
  hits: any;
  links: any;
}

export interface File {
  updated: string;
  size: string;
  mimetype: string;
  version_id: string;
  is_head: boolean;
  created: string;
  tags: any;
  delete_marker: boolean;
  links: {
    self: string,
    version: string,
    uploads: string
  };
  checksum: string;
  key: string;
  showInfo: boolean;
  showChildren: boolean;
  metadata: any;
}

/**
 * Interface representing a search property, on which we can do a specific search
 * with query string like: `q=title:query`.
 */
export interface SearchField {
  label: string;
  path: string;
  selected?: boolean;
}
