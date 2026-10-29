// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { firstValueFrom, of } from 'rxjs';

import type { Error as CoreError } from '../../../core/component/error/error.interface';
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
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideTranslateService(),
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
        total: 2,
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
        expect((data as EsResult).hits.total).toBe(2);
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
      (error: CoreError) => {
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
      (error: CoreError) => {
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
        total: 2,
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

  describe('valueAlreadyExists', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should escape the value and add the filter and the excluded pid', async () => {
      const getRecords = vi.spyOn(service, 'getRecords').mockReturnValue(of({ hits: { total: 0 } } as EsResult));
      const result = firstValueFrom(service.valueAlreadyExists('documents', 'title', 'a "b"\\', '42', 'library.pid:1'));
      await vi.advanceTimersByTimeAsync(500);

      expect(await result).toBeNull();
      expect(getRecords).toHaveBeenCalledWith('documents', {
        query: 'title:"a \\"b\\"\\\\" AND library.pid:1 NOT pid:42',
        itemsPerPage: 1,
      });
    });

    it('should return the raw value when it is already taken', async () => {
      const getRecords = vi.spyOn(service, 'getRecords').mockReturnValue(of({ hits: { total: 1 } } as EsResult));
      const result = firstValueFrom(service.valueAlreadyExists('documents', 'year', 12));
      await vi.advanceTimersByTimeAsync(500);

      expect(await result).toEqual({ alreadyTaken: 12 });
      expect(getRecords).toHaveBeenCalledWith('documents', { query: 'year:12', itemsPerPage: 1 });
    });

    it('should not query the backend before the delay', async () => {
      const getRecords = vi.spyOn(service, 'getRecords').mockReturnValue(of({ hits: { total: 0 } } as EsResult));
      const subscription = service.valueAlreadyExists('documents', 'title', 'foo').subscribe();
      await vi.advanceTimersByTimeAsync(499);
      expect(getRecords).not.toHaveBeenCalled();
      subscription.unsubscribe();
      await vi.advanceTimersByTimeAsync(1);
      expect(getRecords).not.toHaveBeenCalled();
    });
  });
});
