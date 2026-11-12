// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpContextToken, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Set to `true` in the request context to keep the browser HTTP cache
 * for a specific request.
 *
 * @example
 * this.httpClient.get(url, { context: new HttpContext().set(ALLOW_HTTP_CACHE, true) });
 */
export const ALLOW_HTTP_CACHE = new HttpContextToken<boolean>(() => false);

/** Only safe methods produce responses stored by the browser cache. */
const CACHEABLE_METHODS = ['GET', 'HEAD'];

/**
 * Prevent the browser from serving stale API responses from its HTTP cache.
 *
 * The `no-store` cache mode makes the browser get every response from the
 * server, without reading or storing it in its HTTP cache. A revalidation is
 * not enough: when a URL serves several representations of a record, the
 * browser may confirm with a `304 Not Modified` the stored copy of another
 * one. The cache mode requires the Fetch backend, Angular's default, and is
 * ignored with `withXhr()`. Mutating requests and requests that already
 * define a cache mode or a `Cache-Control` header are left untouched.
 */
export function noCacheInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (
    !CACHEABLE_METHODS.includes(req.method) ||
    req.context.get(ALLOW_HTTP_CACHE) ||
    req.cache ||
    req.headers.has('Cache-Control')
  ) {
    return next(req);
  }
  return next(req.clone({ cache: 'no-store' }));
}
