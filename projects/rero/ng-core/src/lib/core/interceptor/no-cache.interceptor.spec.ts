// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpContext, HttpHandlerFn, HttpHeaders, HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { ALLOW_HTTP_CACHE, noCacheInterceptor } from './no-cache.interceptor';

describe('noCacheInterceptor', () => {
  let next: ReturnType<typeof vi.fn<HttpHandlerFn>>;

  const forwarded = (): HttpRequest<unknown> => next.mock.calls[0][0];

  beforeEach(() => {
    next = vi.fn<HttpHandlerFn>(() => of());
  });

  it('should add no-cache headers to a GET request', () => {
    noCacheInterceptor(new HttpRequest('GET', '/api/documents'), next);
    expect(forwarded().headers.get('Cache-Control')).toBe('no-cache');
    expect(forwarded().headers.get('Pragma')).toBe('no-cache');
  });

  it('should add no-cache headers to a HEAD request', () => {
    noCacheInterceptor(new HttpRequest('HEAD', '/api/documents'), next);
    expect(forwarded().headers.get('Cache-Control')).toBe('no-cache');
  });

  it('should not modify a mutating request', () => {
    const req = new HttpRequest('POST', '/api/documents', {});
    noCacheInterceptor(req, next);
    expect(forwarded()).toBe(req);
  });

  it('should not modify a request allowing the cache', () => {
    const req = new HttpRequest('GET', '/api/documents', {
      context: new HttpContext().set(ALLOW_HTTP_CACHE, true)
    });
    noCacheInterceptor(req, next);
    expect(forwarded()).toBe(req);
  });

  it('should keep an existing Cache-Control header', () => {
    const req = new HttpRequest('GET', '/api/documents', {
      headers: new HttpHeaders({ 'Cache-Control': 'max-age=60' })
    });
    noCacheInterceptor(req, next);
    expect(forwarded()).toBe(req);
  });
});
