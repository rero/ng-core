/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RecordService } from './record.service';
import { ApiService } from '../api/api.service';
import { Record } from './record';

describe('RecordService', () => {
  const url = 'https://localhost:5000/api/documents';

  let injector: TestBed;
  let service: RecordService;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['getEndpointByType']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.get(RecordService);

    apiServiceSpy = TestBed.get(ApiService);
    apiServiceSpy.getEndpointByType.and.returnValue(url);

    injector = getTestBed();
    service = injector.get(RecordService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an Observable<Record>', () => {
    const expectedData: Record = {
      aggregations: {},
      hits: {
        total: 2
      },
      links: {}
    };

    service.getRecords('documents', '', 1, 10, [{ key: 'author', values: ['John doe'] }]).subscribe(data => {
      expect(data.hits.total).toBe(2);
    });

    const req = httpMock.expectOne(request => request.method === 'GET' && request.url === url + '/');

    req.flush(expectedData);
  });

  it('should return a 404 error', () => {
    const errorMessage = 'deliberate 404 error';

    service.getRecords('documents').subscribe(
      () => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error).toContain('Something bad happened');
      });

    const req = httpMock.expectOne(request => request.method === 'GET' && request.url === url + '/');

    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  it('should return a network error', () => {
    const errorMessage = 'simulated network error';

    service.getRecords('documents').subscribe(
      () => fail('should have failed with the 404 error'),
      (error: HttpErrorResponse) => {
        expect(error).toContain('Something bad happened');
      });

    const req = httpMock.expectOne(request => request.method === 'GET' && request.url === url + '/');

    const mockError = new ErrorEvent('Network error', {
      message: errorMessage,
    });

    req.error(mockError);
  });

  it('should delete record', () => {
    const pid = '1';

    service.delete('documents', pid).subscribe();

    const req = httpMock.expectOne(request => {
      return request.method === 'DELETE' && request.url === url + '/' + pid;
    });
    req.flush({});
  });
});
