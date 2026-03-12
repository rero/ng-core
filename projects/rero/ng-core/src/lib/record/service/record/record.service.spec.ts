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
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Error } from '../../../core/component/error/error.interface';
import { EsResult } from '../../../model/record.interface';
import { ApiService } from '../api/api.service';
import { RecordService } from './record.service';

describe('RecordService', () => {
  const url = 'https://localhost:5000/api/documents';

  let injector: TestBed;
  let service: RecordService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const apiServiceSpy = {
      getEndpointByType: vi.fn().mockName('ApiService.getEndpointByType'),
    };

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(RecordService);

    apiServiceSpy.getEndpointByType.mockReturnValue(url);

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
    const expectedData: EsResult = {
      aggregations: {},
      hits: {
        total: {
          relation: 'eq',
          value: 2,
        },
        hits: [],
      },
      links: {
        self: '',
      },
    };

    service
      .getRecords('documents', {
        itemsPerPage: 10,
        aggregationsFilters: [{ key: 'author', values: ['John doe'] }],
      })
      .subscribe((data: EsResult | Error) => {
        expect(service.totalHits((data as EsResult).hits.total)).toBe(2);
      });

    const req = httpMock.expectOne((request) => request.method === 'GET' && request.url === url + '/');

    req.flush(expectedData);
  });

  it('should return a 404 error', () => {
    const errorMessage = 'deliberate 404 error';

    service.getRecords('documents').subscribe(
      () => {
        throw new Error('should have failed with the 404 error');
      },
      (error: Error) => {
        expect(error.title).toBe('Not found');
      },
    );

    const req = httpMock.expectOne((request) => request.method === 'GET' && request.url === url + '/');

    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  it('should return a network error', () => {
    const errorMessage = 'simulated network error';

    service.getRecords('documents').subscribe(
      () => {
        throw new Error('should have failed with the 404 error');
      },
      (error: Error) => {
        expect(error.title).toBe('An error occurred');
      },
    );

    const req = httpMock.expectOne((request) => request.method === 'GET' && request.url === url + '/');

    const mockError = new ErrorEvent('Network error', {
      message: errorMessage,
    });

    req.error(mockError);

    httpMock.verify();
  });

  it('should return requested aggregations', () => {
    const expectedData: any = {
      aggregations: {
        authors: {
          buckets: [
            {
              doc_count: 2,
              key: 'Doe, John',
            },
          ],
        },
      },
      hits: {
        total: {
          relation: 'eq',
          value: 2,
        },
        hits: [],
      },
      links: {
        self: '',
      },
    };

    service
      .getRecords('documents', {
        itemsPerPage: 10,
        aggregationsFilters: [{ key: 'author', values: ['John doe'] }],
        facets: ['authors'],
      })
      .subscribe((data: EsResult | Error) => {
        const buckets = ((data as any).aggregations.authors as any)?.buckets as any[];
        expect(buckets?.[0]?.doc_count).toBe(2);
      });

    const req = httpMock.expectOne((request) => request.method === 'GET' && request.url === url + '/');
    req.flush(expectedData);
  });

  it('should get a record detail', () => {
    const expectedData: any = {
      id: '1',
      metadata: {
        pid: '1',
      },
    };

    service.getRecord('documents', '1').subscribe((data) => {
      expect(data.id).toBe('1');
    });

    const req = httpMock.expectOne((request) => {
      return request.method === 'GET' && request.url === url + '/1?resolve=0';
    });

    req.flush(expectedData);
    httpMock.verify();
  });
});
