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
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApiService } from '../api/api.service';
import { Error } from '../error/error';
import { Record } from './record';
import { RecordService } from './record.service';

describe('RecordService', () => {
  const url = 'https://localhost:5000/api/documents';

  let injector: TestBed;
  let service: RecordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getEndpointByType']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(RecordService);

    apiServiceSpy.getEndpointByType.and.returnValue(url);

    injector = getTestBed();
    service = injector.inject(RecordService);
    httpMock = injector.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get records list', () => {
    const expectedData: Record = {
      aggregations: {},
      hits: {
        total: 2
      },
      links: {}
    };

    service.getRecords('documents', '', 1, 10, [{ key: 'author', values: ['John doe'] }]).subscribe((data: Record) => {
      expect(service.totalHits(data.hits.total)).toBe(2);
    });

    const req = httpMock.expectOne(request => request.method === 'GET' && request.url === url + '/');

    req.flush(expectedData);
  });

  it('should return a 404 error', () => {
    const errorMessage = 'deliberate 404 error';

    service.getRecords('documents').subscribe(
      () => fail('should have failed with the 404 error'),
      (error: Error) => {
        expect(error.title).toBe('Not found');
      });

    const req = httpMock.expectOne(request => request.method === 'GET' && request.url === url + '/');

    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  it('should return a network error', () => {
    const errorMessage = 'simulated network error';

    service.getRecords('documents').subscribe(
      () => fail('should have failed with the 404 error'),
      (error: Error) => {
        expect(error.title).toBe('An error occurred');
      });

    const req = httpMock.expectOne(request => request.method === 'GET' && request.url === url + '/');

    const mockError = new ErrorEvent('Network error', {
      message: errorMessage,
    });

    req.error(mockError);

    httpMock.verify();
  });

  it('should get a record detail', () => {
    const expectedData: any = {
      id: '1',
      metadata: {
        pid: '1'
      }
    };

    service.getRecord('documents', '1').subscribe(data => {
      expect(data.metadata.pid).toBe('1');
    });

    const req = httpMock.expectOne(request => {
      return request.method === 'GET' && request.url === url + '/1?resolve=0';
    });

    req.flush(expectedData);
    httpMock.verify();
  });
});
