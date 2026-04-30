# Prompt Templates

These prompt templates help guide the LLM when performing common tasks in this repository.

---

## Fix Angular test

Goal: migrate this test to Vitest.

Constraints:

- do not change business logic
- replace Jasmine APIs with Vitest equivalents
- replace `jasmine.createSpy` with `vi.fn`
- replace `spyOn` with `vi.spyOn`
- keep TestBed only if Angular integration is required

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
