# Project Context

## Stack

- Angular 21
- Standalone components
- TypeScript strict mode
- Zoneless change detection (Zone.js disabled)
- NgRx Signal Store for application state
- Signals preferred over RxJS
- Vitest for testing
- Node 20+

## Architecture principles

- Business logic should be isolated from Angular when possible.
- Prefer pure functions for reusable logic.
- Angular components should remain thin and focused on UI.

## Folder conventions

src/app/
components/
services/
stores/
utils/

- components: UI components
- services: Angular services and API access
- stores: signal-based state management
- utils: framework-independent helpers

## Testing philosophy

- Prefer unit tests without Angular when possible.
- Use TestBed only when Angular integration is required.
- Tests must run with Vitest.

## State management

State management uses **NgRx Signal Store**.

Rules:

- Application state must use NgRx Signal Store.
- Component-local state should use Angular Signals.
- Do not use NgRx reducers/effects/store module.
- Do not introduce BehaviorSubject-based stores.

## CSS layers

The project uses Tailwind CSS v4 (prefix `ui:`) with PrimeNG and the `tailwindcss-primeui` plugin.

CSS cascade layer order (lowest → highest priority):

```
theme < base < components < primeng < utilities < properties
```

Rules:

- Layer order is managed by `cssLayer.order` in `primeng-config.ts`.
- PrimeNG injects its `@layer` declaration before `styles.scss` in the document, establishing the order before Tailwind declares its own layers.
- Tailwind utility classes (`ui:`, `core:`) therefore override PrimeNG component styles.
- Do NOT add a manual `@layer` ordering declaration in `tailwind.css` or `styles.scss`. It would be parsed after PrimeNG's injection and break the intended order.
- The library Tailwind source is `tailwind.css` → compiled to `ng-core-tailwind.scss` via `npm run build-css`.

## Change detection

The application runs in **zoneless mode**.

Rules:

- Zone.js is not used.
- Change detection must rely on Angular Signals.
- Avoid patterns depending on automatic zone-based updates.
