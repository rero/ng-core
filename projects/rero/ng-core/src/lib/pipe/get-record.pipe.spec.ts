/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { Observable, of } from 'rxjs';
import { RecordService } from '../record/record.service';
import { GetRecordPipe } from './get-record.pipe';
import { TestBed } from '@angular/core/testing';

class RecordServiceMock {
  getRecord(type: string, pid: string, resolve = 0): Observable<any> {
    return of({ metadata: { pid, name: 'foo' }});
  }
}

describe('GetRecordPipe', () => {
  let pipe: GetRecordPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GetRecordPipe,
        { provide: RecordService, useClass: RecordServiceMock }
      ]
    })
    pipe = TestBed.inject(GetRecordPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('transform with $ref return object', () => {
    pipe.transform('http://foo/1', 'documents').subscribe((result: object) => {
      expect(result).toEqual({metadata: { pid: '1', name: 'foo' }});
    });
  });

  it('transform with id return name', () => {
    pipe.transform('10', 'documents', 'field', 'name').subscribe((result: string) => {
      expect(result).toEqual('foo');
    });
  });

  it('transform return null', () => {
    pipe.transform('12', 'documents', 'field', 'foo').subscribe((result: string) => {
      expect(result).toBeNull();
    });
  });
});
