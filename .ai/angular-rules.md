<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Angular Rules

Framework version: Angular 22

## Core rules

- Use standalone components only. Standalone is the default since
  Angular 19 — do not set `standalone: true` explicitly, and never set
  `standalone: false`.
- Do not introduce NgModules.
- Prefer Angular Signals for local state.
- Avoid RxJS when Signals are sufficient.
- Use strict TypeScript typing.

## Component design

- Components must remain small and focused on UI.
- Business logic should not live inside components.
- Move reusable logic to services or pure functions.

## Change detection

- OnPush is the default change detection strategy since Angular 22.
  Do not set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly
  on `@Component`.

## Templates

- Translate with the pipe, `{{ 'Key' | translate }}` or
  `[label]="'Key' | translate"`. Never use the element content as key
  (`<span translate>Key</span>`) nor a bare `translate` attribute:
  ngx-translate 18 warns for each element and removes it in version 19.
- Mark an `ngModel` that only drives a control of the component itself with
  `[ngModelOptions]="{ standalone: true }"` (e.g. inside a Formly field type
  or a search filter): Angular 22 warns when an `ngModel` sits in a parent
  form it cannot register with.

## Dependency injection

- Avoid unnecessary services.
- Prefer simple utility functions when Angular DI is not needed.
- Use `@Service()` instead of `@Injectable({ providedIn: 'root' })` for
  root-provided, tree-shakable services (available since Angular 22).
- Use `@Service({ autoProvided: false })` instead of a bare `@Injectable()`
  for services that must be registered explicitly in a `providers` array
  (e.g. route guards, translation loaders provided via a factory).

## State management

State management rules:

1. Local component state → Angular Signals
2. Application state → NgRx Signal Store

Use:

- @ngrx/signals
- signalStore
- withState
- withMethods
- withComputed
- signalStoreFeature

Do not use:

- NgRx Store (createReducer, createEffect)
- BehaviorSubject stores
- custom RxJS state services

## Code quality

- Avoid the use of `any`.
- Prefer explicit types.
- Keep functions small and testable.
- All code comments must be written in English.

## Zoneless mode

This project runs without Zone.js.

Rules:

- Do not rely on zone-based change detection.
- Prefer Angular Signals to trigger updates.
- Avoid patterns requiring `NgZone`.
- Do not introduce `zone.js` dependencies.
