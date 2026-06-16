// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Error, RecordService } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import data from './recordData.json';
import JSONSchema from './schema.json';
import SimpleJSONSchema from './simple-schema.json';
import simpleData from './simple-record-data.json';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

/* eslint-disable @typescript-eslint/no-unused-vars */

@Injectable({
  providedIn: 'root',
})
export class RecordServiceMock extends RecordService {
  getSchemaForm(recordType: string): Observable<any> {
    return of({ schema: recordType === 'demo' ? JSONSchema : SimpleJSONSchema });
  }

  getRecord(
    type: string,
    pid: string,
    {
      resolve = 0,
      headers = new HttpHeaders({ 'Content-Type': 'application/json' }),
    }: {
      resolve?: number;
      headers?: HttpHeaders | Record<string, string | string[]>;
    } = {},
  ): Observable<any | Error> {
    return of(type === 'demo' ? data : simpleData);
  }
}
