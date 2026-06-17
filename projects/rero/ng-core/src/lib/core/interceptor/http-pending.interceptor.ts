// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HttpPendingService } from '../service/http-pending/http-pending.service';

export function httpPendingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const service = inject(HttpPendingService);
    service.increment();
    return next(req).pipe(finalize(() => service.decrement()));
  }
  return next(req);
}
