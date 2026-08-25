<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Project Context

## Stack

- Angular 22
- Standalone components
- TypeScript strict mode
- Zoneless change detection (Zone.js disabled)
- NgRx Signal Store for application state
- Signals preferred over RxJS
- Vitest for testing
- Node 24 (matches `.github/workflows/main.yml`)

## Architecture principles

- Business logic should be isolated from Angular when possible.
- Prefer pure functions for reusable logic.
- Angular components should remain thin and focused on UI.

## Folder conventions

This is an Angular workspace with two projects:

- `projects/rero/ng-core/src/lib/` — the publishable `@rero/ng-core` library,
  organized by domain: `core/` (shared components, services, pipes), `formly/`
  (form field types/wrappers), `record/` (search, detail, editor), `translate/`
  (i18n services/pipes), `model/` (framework-independent types).
- `projects/ng-core-tester/src/app/` — a demo app consuming the library,
  organized by feature (`home/`, `menu/`, `record/`, `search-bar/`, `service/`).

Within a domain folder, components/services/stores are colocated with their
feature rather than split into top-level `components/`, `services/`, `stores/`
folders (e.g. `record/component/search/store/record-search.store.ts`).

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

The project uses Tailwind CSS v4 (prefix `ui:`) with Optimus UI and the `@openng/optimus-ui-tailwindcss` plugin.

CSS cascade layer order (lowest → highest priority):

```
theme < base < components < optimus < utilities < properties
```

Rules:

- Layer order is managed by `cssLayer.order` in `optimus-ui-config.ts`.
- Optimus UI injects its `@layer` declaration before `styles.scss` in the document, establishing the order before Tailwind declares its own layers.
- Tailwind utility classes (`ui:`, `core:`) therefore override Optimus UI component styles.
- Do NOT add a manual `@layer` ordering declaration in `tailwind.css` or `styles.scss`. It would be parsed after Optimus UI's injection and break the intended order.
- The library Tailwind source is `tailwind.css` → compiled to `ng-core-tailwind.scss` via `pnpm run build-css`.

## Change detection

The application runs in **zoneless mode**.

Rules:

- Zone.js is not used.
- Change detection must rely on Angular Signals.
- Avoid patterns depending on automatic zone-based updates.
