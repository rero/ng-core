# Copilot Repository Instructions

This repository uses Angular 21.

Copilot must follow the rules defined in:

- .ai/project-context.md
- .ai/angular-rules.md
- .ai/testing-rules.md
- .ai/dev-commands.md

## Important constraints

- Use Angular standalone components only.
- Do not introduce NgModules.
- Prefer Angular Signals instead of RxJS when possible.
- Use Vitest for testing.
- Do not introduce Karma or Jasmine.

## Code generation guidelines

When generating Angular code:

- keep components small
- move business logic outside components
- prefer strict TypeScript types
- avoid `any`

## Development commands

When suggesting commands, use the commands defined in:

.ai/dev-commands.md

## Additional architecture patterns:

.ai/angular-patterns.md
