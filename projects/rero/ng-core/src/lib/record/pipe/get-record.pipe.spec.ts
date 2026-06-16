// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Observable, of } from 'rxjs';
import { RecordService } from '../service/record/record.service';
import { GetRecordPipe } from './get-record.pipe';
import { TestBed } from '@angular/core/testing';

class RecordServiceMock {
  getRecord(type: string, pid: string): Observable<any> {
    return of({ metadata: { pid, name: 'foo' } });
  }
}

describe('GetRecordPipe', () => {
  let pipe: GetRecordPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetRecordPipe, { provide: RecordService, useClass: RecordServiceMock }],
    });
    pipe = TestBed.inject(GetRecordPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transform with $ref return object', () => {
    pipe.transform('http://foo/1', 'documents').subscribe((result: any) => {
      expect(result).toEqual({ metadata: { pid: '1', name: 'foo' } });
    });
  });

  it('transform with id return name', () => {
    pipe.transform('10', 'documents', 'field', 'name').subscribe((result: any) => {
      expect(result).toEqual('foo');
    });
  });

  it('transform return null', () => {
    pipe.transform('12', 'documents', 'field', 'foo').subscribe((result: any) => {
      expect(result).toBeNull();
    });
  });
});
