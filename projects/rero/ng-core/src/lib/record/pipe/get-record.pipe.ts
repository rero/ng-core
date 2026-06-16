// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpHeaders } from '@angular/common/http';
import { inject, Pipe, PipeTransform } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { extractIdOnRef } from '../../core/utils/utils';
import { RecordService } from '../service/record/record.service';
import { Observable, of } from 'rxjs';
import { JsonValue, RecordData } from '../../model';

/**
 * Get a record by its PID.
 */
@Pipe({ name: 'getRecord' })
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
  transform(
    pid: string,
    type: string,
    returnType = 'object',
    field?: string,
    headers?: HttpHeaders | Record<string, string | string[]>,
  ): Observable<RecordData | JsonValue | null> {
    // process $ref entrypoint
    if (pid.startsWith('http')) {
      pid = extractIdOnRef(pid);
    }

    if ('object' !== returnType) {
      returnType = 'field';
    }

    return this.recordService
      .getRecord(type, pid, { resolve:1, headers: headers || new HttpHeaders({ 'Content-Type': 'application/json' }) })
      .pipe(
        map((data) => {
          if (!data) {
            return null;
          }
          if ('object' === returnType) {
            return data;
          }
          if (field && field in data.metadata) {
            return data.metadata[field];
          }
          return null;
        }),
        catchError((error) => {
          console.error('[GetRecordPipe]', error);
          return of(null);
        }),
      );
  }
}
