// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HttpPendingService {
  private _count = signal(0);
  readonly isPending = computed(() => this._count() > 0);

  increment(): void { this._count.update(n => n + 1); }
  decrement(): void { this._count.update(n => Math.max(0, n - 1)); }
}
