<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Angular Patterns

# Zoneless component pattern

Components rely on signals for UI updates.

Example:

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent {

  store = inject(CounterStore)

  count = this.store.count

}

## NgRx Signal Store

Application state should be implemented using NgRx Signal Store.

Example pattern:

import { signalStore, withState, withMethods } from '@ngrx/signals';

export const CounterStore = signalStore(
  { providedIn: 'root' },

  withState({
    count: 0
  }),

  withMethods((store) => ({
    increment() {
      store.count.update(v => v + 1)
    }
  }))
  )

Usage in component:

@Component({
  standalone: true
})
export class CounterComponent {
  store = inject(CounterStore)
}

## Guard double-clic sur les appels backend en écriture

Three patterns depending on the context.

### Pattern A — HTTP mutations (POST/PUT/PATCH/DELETE)

Use `HttpPendingService` + `httpPendingInterceptor`. The interceptor automatically
tracks in-flight mutations; no manual state management needed.

Register the interceptor once in `app.config.ts`:

```typescript
import { httpPendingInterceptor } from '@rero/ng-core';

provideHttpClient(withInterceptors([httpPendingInterceptor]))
```

In the component:

```typescript
import { HttpPendingService } from '@rero/ng-core';

protected readonly httpPending = inject(HttpPendingService);

submit(): void {
  if (this.httpPending.isPending()) return; // guard
  // ... call API
}
```

Template:

```html
<p-button [disabled]="httpPending.isPending()" (click)="submit()" />
```

Special case — keep disabled after a 409/412 conflict (requires page reload):

```typescript
private readonly _keepDisabled = signal(false);
readonly isSaveDisabled = computed(() => this.httpPending.isPending() || this._keepDisabled());

// in catchError:
catchError(error => {
  if (error.status === 409 || error.status === 412) {
    // set after finalize so it overrides the isPending reset
  }
  return this._handleError(error);
}),
finalize(() => { if (isConflict) this._keepDisabled.set(true); }),
```

### Pattern B — Dialog close / one-shot (no HTTP)

When a button closes a dialog or emits an `@Output()` without an HTTP call,
`HttpPendingService` does not apply. Use a one-shot signal (never reset because
the dialog closes):

```typescript
readonly isSending = signal(false);

confirm(): void {
  if (this.isSending()) return;
  this.isSending.set(true);
  this.confirm.emit();
}
```

Template:

```html
<p-button [disabled]="formGroup.invalid || isSending()" (click)="confirm()" />
```

### Pattern C — Search / scan input guard

When a search or barcode scan triggers an async lookup, guard with
`HttpPendingService` and disable the input:

```typescript
searchValueUpdated(value: string): void {
  if (this.httpPending.isPending()) return;
  // ... trigger search
}
```

Template:

```html
<ng-core-search-input [disabled]="httpPending.isPending()" />
```
