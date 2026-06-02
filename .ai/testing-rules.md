# Testing Rules

Testing framework: Vitest

## Allowed testing APIs

Use the Vitest testing API:

- describe()
- it()
- expect()
- beforeEach()
- afterEach()

Spies and mocks:

- vi.fn()
- vi.spyOn()

## Do not use

The following tools must not be introduced:

- Karma
- Jasmine
- jasmine.createSpy
- jasmine.clock

## Angular testing

Prefer tests that do not require Angular.

Priority order:

1. Pure function tests
2. Service tests without TestBed
3. Angular integration tests using TestBed

Use TestBed only when Angular features are required:

- dependency injection
- component rendering
- directives/pipes

## Component tests

When testing components:

- import standalone components directly
- avoid large testing modules
- mock dependencies with simple objects when possible

Example pattern:

describe('MyComponent', () => {

it('should compute value', () => {
const result = computeSomething(2)
expect(result).toBe(4)
})

})

## Test performance

Tests must:

- run with Vitest
- support watch mode
- remain fast and isolated

## Zoneless testing

The application runs without Zone.js.

Do not use:

- fakeAsync
- tick
- flush

Prefer:

- async/await
- Promise-based testing

## Migration patterns (Jasmine → Vitest)

| Before | After |
|---|---|
| `waitForAsync(() => {` | `async () => {` |
| `fakeAsync(() => {` | `async () => {` |
| `tick(N)` | `await new Promise(r => setTimeout(r, N))` |
| `tick()` | `await Promise.resolve()` |
| `.compileComponents()` | remove (no-op in Angular 14+) |
| `fail('msg')` | `throw new Error('msg')` |
| `jasmine.createSpy` | `vi.fn()` |
| `spyOn(obj, 'method')` | `vi.spyOn(obj, 'method')` |

- Spy types: use `any` instead of `MockedObject<T>` for partial mocks
- Remove `.mockName('...')` from `vi.fn()` chains (causes TS errors)

## setTimeout in tests

`setTimeout(() => { expect(...) }, N)` **without await** leaks into subsequent tests.

Always use:

```ts
await new Promise(resolve => setTimeout(resolve, N));
expect(...);
```

## Router navigation in tests

`router.navigate()` returns a Promise — always `await` it for title/state to update.
`await Promise.resolve()` is NOT sufficient.

## @ngx-formly/core/testing

- `createFieldComponent()` returns `{ query, queryAll, fixture, ... }`
- `query(selector)` → single `DebugElement` (null if not found)
- `queryAll(selector)` → `DebugElement[]` — use for `toHaveLength(N)` assertions
