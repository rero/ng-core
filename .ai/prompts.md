<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Prompt Templates

These prompt templates help guide the LLM when performing common tasks in this repository.

---

## Refactor Angular component

Goal: simplify this component.

Constraints:

- Angular 21
- standalone components only
- do not introduce NgModules
- move business logic outside components when possible
- avoid RxJS if Angular Signals are sufficient
- keep change detection strategy OnPush

---

## Improve typing

Goal: improve TypeScript typing.

Constraints:

- do not introduce `any`
- prefer explicit types
- keep code compatible with strict TypeScript mode

---

## Write unit test

Goal: write a unit test for the provided code.

Constraints:

- use Vitest
- prefer pure function testing
- avoid TestBed unless Angular integration is required
- keep the test minimal and readable
