<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Angular Patterns

## Zoneless component pattern

Components rely on signals for UI updates.

```typescript
@Component({})
export class CounterComponent {
  private readonly store = inject(CounterStore);

  readonly count = this.store.count;
}
```

## NgRx Signal Store

Application state should be implemented using NgRx Signal Store. The state
signals are read-only: update them with `patchState()`.

```typescript
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export const CounterStore = signalStore(
  { providedIn: 'root' },
  withState({ count: 0 }),
  withMethods((store) => ({
    increment(): void {
      patchState(store, (state) => ({ count: state.count + 1 }));
    },
  })),
);
```

## Optional features of `provideCore()`

`provideCore()` only provides the core; the optional parts are opted in, so
applications that do not use them leave their code and dependencies out:

```typescript
import { provideCore } from '@rero/ng-core';
import { withBarcodeScanner } from '@rero/ng-core/barcode-scanner';
import { provideCoreFormly } from '@rero/ng-core/editor';

providers: [
  provideCore(withBarcodeScanner()), // features: { ɵkind, ɵproviders }, as Angular's provideRouter()
  provideCoreFormly(), // only for the applications displaying forms
];
```

`provideCoreFormly()` can also be registered in the `providers` of a route, as
`ngCoreEditorRoutes` does, so the editor and Formly are loaded lazily.

## Guard against double clicks on backend writes

Three patterns depending on the context.

### Pattern A — HTTP mutations (POST/PUT/PATCH/DELETE)

Use `HttpPendingService` + `httpPendingInterceptor`. The interceptor automatically
tracks in-flight mutations; no manual state management needed.

Register the interceptor once in `app.config.ts`:

```typescript
import { httpPendingInterceptor } from '@rero/ng-core';

provideHttpClient(withInterceptors([httpPendingInterceptor]));
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

// in the request pipe:
let isConflict = false;
request$.pipe(
  catchError((error: HttpErrorResponse) => {
    isConflict = error.status === 409 || error.status === 412;
    return this._handleError(error);
  }),
  // set after finalize so it overrides the isPending reset
  finalize(() => { if (isConflict) this._keepDisabled.set(true); }),
);
```

### Pattern B — Dialog close / one-shot (no HTTP)

When a button closes a dialog or emits a one-shot `output()` (an
`OutputEmitterRef`, not a signal) without an HTTP call, `HttpPendingService`
does not apply. Guard with a signal instead (never reset, since the dialog
closes right after):

```typescript
readonly confirm = output<void>();
readonly isSending = signal(false);

onConfirm(): void {
  if (this.isSending()) return;
  this.isSending.set(true);
  this.confirm.emit();
}
```

Template:

```html
<p-button [disabled]="formGroup.invalid || isSending()" (click)="onConfirm()" />
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
