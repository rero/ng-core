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
import { Error, RecordService } from "@rero/ng-core";
import { Observable, of } from "rxjs";
import data from './recordData.json';
import JSONSchema from './schema.json';
import SimpleJSONSchema from './simple-schema.json';
import simpleData from './simple-record-data.json';
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class RecordServiceMock extends RecordService {
  getSchemaForm(recordType: string): Observable<any> {
    return of({ schema: recordType === 'demo' ? JSONSchema : SimpleJSONSchema });
  }

  getRecord(type: string, pid: string, resolve = 0, headers: any = {}): Observable<any | Error> {
    return of(type === 'demo' ? data : simpleData);
  }
}
