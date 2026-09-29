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
 * The headers force the browser to revalidate any stored response with the
 * server, which either sends a fresh response or confirms with a
 * `304 Not Modified` that the stored one is still up to date. Mutating
 * requests and requests that already define a `Cache-Control` header are
 * left untouched.
 */
export function noCacheInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (
    !CACHEABLE_METHODS.includes(req.method)
    || req.context.get(ALLOW_HTTP_CACHE)
    || req.headers.has('Cache-Control')
  ) {
    return next(req);
  }
  return next(req.clone({
    setHeaders: {
      'Cache-Control': 'no-cache',
      // HTTP/1.0 proxies only understand the Pragma header
      Pragma: 'no-cache'
    }
  }));
}
