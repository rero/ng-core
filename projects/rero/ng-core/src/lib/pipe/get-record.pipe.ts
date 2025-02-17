/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { inject, Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { RecordService } from '../record/record.service';
import { extractIdOnRef } from '../utils/utils';

/**
 * Get a record by its PID.
 */
@Pipe({
    name: 'getRecord',
    standalone: false
})
export class GetRecordPipe implements PipeTransform {

  protected recordService: RecordService = inject(RecordService);

  /**
   * Return record data corresponding to PID.
   *
   * @param pid Record PID.
   * @param type Type of the resource.
   * @param returnType Type of data to return.
   * @param field Field to return.
   * @return Record or field record corresponding to PID.
   */
  transform(pid: any, type: string, returnType = 'object', field?: string, headers?: object): any {
    // process $ref entrypoint
    if (pid.startsWith('http')) {
      pid = extractIdOnRef(pid);
    }

    if ('object' !== returnType) {
      returnType = 'field';
    }

    return this.recordService.getRecord(type, pid, 1, headers).pipe(map(data => {
      if (!data) {
        return null;
      }
      if ('object' === returnType) {
        return data;
      }
      if (field in data.metadata) {
        return data.metadata[field];
      }
      return null;
    }));
  }
}
