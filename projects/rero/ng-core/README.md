<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# RERO Angular Core Library

An Angular library providing components, services, pipes, directives and state management primitives for RERO projects that integrate with [Invenio](https://inveniosoftware.org/) REST APIs.

## Requirements

- Node 24
- npm 11
- Angular 21
- Standalone components (no NgModules)

## Installation

```bash
npm install @rero/ng-core
```

Install required peer dependencies:

```bash
npm install \
  @angular/cdk \
  @ngrx/signals \
  @ngx-formly/core @ngx-formly/primeng \
  @ngx-translate/core \
  @primeuix/themes primeng primelocale \
  crypto-js easymde font-awesome generate-password-lite \
  katex lodash-es luxon marked ngx-spinner rxjs
```

## Setup

Register the library providers in your application config:

```ts
// app.config.ts
import { provideCore } from '@rero/ng-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    // ...
  ]
};
```

`provideCore()` registers PrimeNG services (`ConfirmationService`, `DialogService`, `MessageService`), the Formly configuration, `NgCoreTranslateService`, and the page title strategy.

### Configuration

Extend `CoreConfigService` to supply application-level settings:

```ts
import { Injectable } from '@angular/core';
import { CoreConfigService } from '@rero/ng-core';

@Injectable({ providedIn: 'root' })
export class AppConfigService extends CoreConfigService {
  constructor() {
    super();
    this.production = false;
    this.apiBaseUrl = 'https://localhost:5000';
    this.schemaFormEndpoint = '/api/schemaform';
    this.$refPrefix = 'https://your-domain.ch';
    this.languages = ['fr', 'de', 'en', 'it'];
  }
}
```

Then override `CoreConfigService` in your providers:

```ts
providers: [
  { provide: CoreConfigService, useClass: AppConfigService }
]
```

---

## API Reference

### Components

#### Core

| Component | Description |
| --- | --- |
| `ReadMoreComponent` | Displays text with a configurable word/character truncation limit and a "show more / show less" toggle. |
| `DialogComponent` | Generic confirmation dialog backed by PrimeNG `DynamicDialogRef`. |
| `ErrorComponent` | Full-page error display with HTTP status code, title, and optional message. |
| `SearchInputComponent` | Search input with optional label and addon slot; emits on Enter or button click. |
| `AbstractCanDeactivateComponent` | Base class for components that guard against unsaved-change navigation. |

#### Record module

| Component | Description |
| --- | --- |
| `RecordSearchPageComponent` | Top-level search page; synchronises search state with the URL via `RecordSearchStore`. |
| `RecordSearchComponent` | Search interface with tabs, aggregation filters, result list, sorting, export, and pagination. |
| `DetailComponent` | Fetches and displays a single record with dynamically loaded detail and action components. |
| `DefaultDetailComponent` | Default template for record detail view. |
| `DetailButtonComponent` | Edit / delete action buttons for a record detail. |
| `SearchAutocompleteComponent` | Autocomplete suggestions for record search queries. |
| `EditorComponent` | JSON Schema–driven form editor (create / edit a record) with save and cancel. |

#### Formly field types

| Type key | Component | Description |
| --- | --- | --- |
| `input` | `InputComponent` | Text, email, password, number fields with optional addon buttons. |
| `array` | `ArrayComponent` | Dynamic array with add / remove and min/max item constraints. |
| `datepicker` | `DatePickerComponent` | Date picker backed by PrimeNG Calendar. |
| `textarea` | `TextareaComponent` | Multi-line text input. |
| `markdown` | `MarkdownComponent` | Markdown editor powered by EasyMDE. |
| `select` | `SelectComponent` | Single-value dropdown. |
| `multiselect` | `MultiSelectComponent` | Multi-value dropdown. |
| `multicheckbox` | `MultiCheckboxComponent` | Checkbox group for array fields. |
| `radio` | `RadioButtonComponent` | Radio button group. |
| `toggle` | `SwitchComponent` | Toggle switch. |
| `treeselect` | `TreeSelectComponent` | Hierarchical tree selection. |
| `password-generator` | `PasswordGeneratorComponent` | Password field with configurable generation. |
| `object` | `ObjectComponent` | Nested object / field group. |
| `multischema` | `MultischemaComponent` | `oneOf` / `anyOf` schema selector. |
| `remote-autocomplete` | `RemoteAutocompleteComponent` | Autocomplete backed by a remote API. |

#### Formly wrappers

| Wrapper | Description |
| --- | --- |
| `HideWrapper` | Conditionally hides a field. |
| `CardWrapper` | Wraps a field in a card. |
| `FormFieldWrapper` | Standard field wrapper with label and validation messages. |

---

### Services

| Service | Description |
| --- | --- |
| `CoreConfigService` | Central configuration (API base URL, languages, `$refPrefix`, etc.). Extend to customise. |
| `LocalStorageService` | AES-encrypted local storage with `set()`, `get()`, `remove()`, `clear()`, `has()`, `isExpired()`, and observable change events. |
| `CryptoJsService` | Low-level AES `encrypt(value)` / `decrypt(value)` wrapper around CryptoJS. |
| `NgCoreTranslateService` | Extends `@ngx-translate/core`; synchronises Luxon and PrimeNG locale on language change. |
| `TranslateLanguageService` | Converts ISO 639-2 language codes to human-readable names in de/en/fr/it. |
| `RecordService` | CRUD operations against an Invenio REST API: `getRecords()`, `getRecord()`, `create()`, `update()`, `delete()`, `valueAlreadyExists()`. |
| `ApiService` | Builds typed API endpoint URLs (records, exports, `$ref`, schema forms). |
| `RecordUiService` | Orchestrates record UI flows: confirmation dialogs, deletion, permission resolution. |
| `RecordHandleErrorService` | Translates HTTP errors (including Marshmallow validation errors) into user-facing messages. |

---

### Pipes

| Pipe | Description |
| --- | --- |
| `Nl2brPipe` | Replaces `\n` with `<br>` tags. |
| `FilesizePipe` | Formats a byte count as a human-readable string (kB, MB, GB …). |
| `TruncateTextPipe` | Truncates text by word or character count with a configurable trailing indicator. |
| `UpperCaseFirstPipe` | Capitalises the first letter of a string. |
| `MarkdownPipe` | Renders a Markdown string to sanitised HTML via `marked`. |
| `CallbackArrayFilterPipe` | Filters an array using a callback function. |
| `DateTranslatePipe` | Angular `DatePipe` wrapper that automatically uses the current locale. |
| `TranslateLanguagePipe` | Translates an ISO 639-2 code to its full language name. |
| `GetRecordPipe` | Fetches a record by PID (or `$ref` URL) and returns an observable, optionally extracting a single field. |

---

### Directives

| Directive | Description |
| --- | --- |
| `KatexDirective` | Auto-renders LaTeX math expressions inside an element using KaTeX. Watches for DOM changes via `MutationObserver`. Usage: `<span katex [katexOptions]="opts">$x^2$</span>` |

---

### State management

#### `RecordSearchStore`

An NgRx Signal Store that drives the record search UI. Features:

| Feature | Signals | Methods |
| --- | --- | --- |
| Search params | `queryString`, `page`, `size`, `sort` | `syncUrlParams()`, `updatePage()`, `updateSize()` |
| Results | `esResult`, `loading`, `total` | `fetchRecords()` |
| Aggregations | `aggregations`, `aggregationsFilters` | `updateAggregationsFilter()`, `applyDefaultFilters()` |
| Config | `currentType`, `config` | `updateCurrentType()`, `updateRouteConfig()` |

---

### Validators

| Validator | Description |
| --- | --- |
| `greaterThanValidator(start, end)` | Reactive-form validator that ensures `end` time is after `start`. |
| `RangePeriodValidator()` | Validates open/closed time-period constraints. |
| `createValidator(recordService, type, field, excludePid)` | Async validator that calls the API to check for duplicate field values. |
| `emailValidator` | Formly validator for email format. |

---

### Guards

| Guard | Description |
| --- | --- |
| `ComponentCanDeactivateGuard` | Prevents route deactivation when a component extending `AbstractCanDeactivateComponent` reports unsaved changes. |

---

### Utilities

```ts
import { extractIdOnRef, cleanDictKeys, capitalize, removeChars } from '@rero/ng-core';
```

| Function | Description |
|---|---|
| `extractIdOnRef(ref)` | Extracts a record PID from a `$ref` URL. |
| `cleanDictKeys(data)` | Recursively removes `null` and empty values from an object. |
| `capitalize(value)` | Capitalises the first letter of a string. |
| `removeChars(value, chars?)` | Removes the specified characters from a string. |

---

### Translation

`NgCoreTranslateService` wraps `@ngx-translate/core` and keeps Luxon and PrimeNG in sync. Override the translation loader to supply your own translations:

```ts
// custom-translate-loader.ts
import { NgCoreTranslateLoader } from '@rero/ng-core';
import { of } from 'rxjs';

export class CustomTranslateLoader extends NgCoreTranslateLoader {
  private translations = {
    fr: { Welcome: 'Bienvenue' },
    de: { Welcome: 'Willkommen' },
  };

  getTranslation(lang: string) {
    return of(this.translations[lang] ?? {});
  }
}
```

```ts
// app.config.ts
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: { provide: TranslateLoader, useClass: CustomTranslateLoader },
      })
    ),
  ]
};
```

Switch language at runtime:

```ts
translateService.setLanguage('fr');
```

---

## Local development

```bash
git clone https://github.com/rero/ng-core.git
cd ng-core
npm install
ng build @rero/ng-core
npm run serve        # launches the tester application
```

### Install a local build in another project

**`npm link` (fastest)**

```bash
cd /path/to/ng-core
ng build @rero/ng-core
cd dist/rero/ng-core
npm link

cd /path/to/your-project
npm link @rero/ng-core
```

**`npm pack` (closest to published registry)**

```bash
cd /path/to/ng-core
ng build @rero/ng-core
cd dist/rero/ng-core
npm pack
# creates rero-ng-core-X.X.X.tgz

cd /path/to/your-project
npm install /path/to/rero-ng-core-X.X.X.tgz
```

## Running tests

```bash
ng test @rero/ng-core --watch=false --headless
```
