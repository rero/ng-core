# Development Commands

These are the official commands for working with this repository.
LLM tools should prefer these commands instead of inventing new ones.

## Install dependencies

npm install

## Development server

Start the Angular development server:

npm run serve

## Compile assets

Compile css tailwind style files:

npm run build-css

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

npm run lint

## Format

Run Prettier:

npm run format

## Full quality check

Run all quality checks:

./run-tests.sh
