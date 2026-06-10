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
import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HttpPendingService {
  private _count = signal(0);
  readonly isPending = computed(() => this._count() > 0);

  increment(): void { this._count.update(n => n + 1); }
  decrement(): void { this._count.update(n => Math.max(0, n - 1)); }
}
