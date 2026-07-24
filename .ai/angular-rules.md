<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Angular Rules

Framework version: Angular 21

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

- Use OnPush change detection by default.

Example:

@Component({
changeDetection: ChangeDetectionStrategy.OnPush
})

## Dependency injection

- Avoid unnecessary services.
- Prefer simple utility functions when Angular DI is not needed.

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
