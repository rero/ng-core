<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# Development Commands

These are the official commands for working with this repository.
LLM tools should prefer these commands instead of inventing new ones.

## Install dependencies

pnpm install

## Development server

Start the Angular development server:

pnpm run serve

## Compile assets

Compile css tailwind style files:

pnpm run build-css

## Build

Build the Angular library project:

ng build @rero/ng-core

Build the Angular testing application project:

ng build ng-core-tester

## Tests

Run Angular library tests with Vitest:

ng test @rero/ng-core --watch=false --headless

Run Angular testing application tests with Vitest:

ng test ng-core-tester --watch=false --headless

## Lint

Run ESLint:

pnpm run lint

## Format

Run Prettier (imports sorted by `@ianvs/prettier-plugin-sort-imports`):

pnpm run format

Check the formatting, as the CI does:

pnpm run format:check

VS Code formats the files on save with the Prettier extension
(`.vscode/settings.json`).

## Translations

Extract the translation keys of the library (main entry, `editor` and
`barcode-scanner`):

pnpm run extract_messages

## Pack

Build the library in production mode and pack it as `rero-ng-core-X.X.X.tgz`
at the repository root, to install it in an application before it is
published:

pnpm run pack

## Full quality check

Run all quality checks (library and tester builds, CSS, lint, tests, pack):

./run-tests.sh
