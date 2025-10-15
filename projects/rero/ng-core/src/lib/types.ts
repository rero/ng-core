/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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
import { ActionStatus } from "./record/action-status";

export interface InvenioRecord { created : string, id : string, links : object, metadata: object, updated : string }

export interface EsResult {
  aggregations : object,
  hits : { 
    hits: InvenioRecord[], 
    total : {
      relation : string, 
      value : number
    }
  } 
}

export interface ExportFormat { endpoint: string, disableMaxRestResultsSize: boolean, format: string }

export interface ExportFormatConfig { label: string, url: string, disable : boolean, disabled_message: string }

export interface Url { link: string, external: boolean }

export interface AggregationsFilter {
  key: string;
  values: any[];
}

export interface RecordsAggregation {
  doc_count: number,
  type : string,
  config: any,
  name: string,
  buckets: any[]
}

export type CanPermission = (record : InvenioRecord) => Observable<ActionStatus>;

export interface RecordPermissions {
  canAdd?: CanPermission;
  canUpdate?: CanPermission;
  canDelete?: CanPermission;
  canRead?: CanPermission;
}

