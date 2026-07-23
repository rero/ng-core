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

Run Prettier:

pnpm run format

## Full quality check

Run all quality checks:

./run-tests.sh
