/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { HttpPendingService } from '../service/http-pending/http-pending.service';

export function httpPendingInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const service = inject(HttpPendingService);
    service.increment();
    return next(req).pipe(finalize(() => service.decrement()));
  }
  return next(req);
}
