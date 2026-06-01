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
