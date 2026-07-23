<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# RERO angular core library

This library provides standalone components, services, pipes and providers
for common usage in Angular projects. It has no `NgModule` — everything is
consumed either as a standalone import or through a `provide*` function
registered in your application's `providers` array.

The library is organized in four areas:

* **Core** — generic UI components, pipes, guards and configuration.
* **Formly** — field types, wrappers and helpers for `@ngx-formly`.
* **Translate** — `ngx-translate` integration with per-app extensible
  language loading.
* **Record** — components and services to interact with Invenio resources
  (search, detail, editor).

## Requirements

* Node.js 24 or bigger (see `.github/workflows/main.yml` for the version
  used in CI)
* Angular 21 (standalone APIs, zoneless change detection)

## Installation

To install this library, simply do:

```
$ pnpm add @rero/ng-core
```

## Configuration

Register `provideCore()` in your application's providers. This wires up
Formly configuration, PrimeNG dialog/message/confirmation services, the
page title strategy and the translate service used by the library.

`provideCore()` does not provide PrimeNG's own configuration, animations
or `HttpClient` — those remain your application's responsibility, as
shown in `projects/ng-core-tester/src/app/app.config.ts`:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideCore } from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideAnimations(),
    providePrimeNG({ theme: /* your PrimeNG theme preset */ {} }),
    provideHttpClient(),
    // ...your other providers
  ],
};
```

### Overriding the library configuration

Create a service extending `CoreConfigService` for storing configuration
data:

```typescript
// app-config.service.ts
import { Injectable } from '@angular/core';
import { CoreConfigService } from '@rero/ng-core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService extends CoreConfigService {
  constructor() {
    super();
    this.production = environment.production;
    this.projectTitle = environment.projectTitle;
    this.apiBaseUrl = environment.apiBaseUrl;
    this.schemaFormEndpoint = '/api/schemaform';
    this.$refPrefix = environment.$refPrefix;
    this.defaultLanguage = 'en';
    this.translationsURLs = environment.translationsURLs;
  }
}
```

Then override `CoreConfigService` with the new one in `app.config.ts`:

```typescript
import { AppConfigService } from './app-config.service';
import { CoreConfigService } from '@rero/ng-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    { provide: CoreConfigService, useExisting: AppConfigService },
  ],
};
```

`CoreConfigService` fields (see
`src/lib/core/service/core-config/core-config.service.ts` for the
authoritative source):

| Field                | Type       | Purpose                                     |
|-----------------------|------------|----------------------------------------------|
| `production`          | `boolean`  | Production flag                               |
| `projectTitle`         | `string`   | Used by `PageTitleStrategy`                   |
| `apiBaseUrl`           | `string`   | Base URL for the Invenio API                  |
| `apiEndpointPrefix`    | `string`   | API path prefix (default `/api`)              |
| `$refPrefix`           | `string`   | Prefix stripped from `$ref` URLs              |
| `schemaFormEndpoint`   | `string`   | Endpoint serving JSON schemas                 |
| `defaultLanguage`      | `string`   | Fallback language (default `en`)              |
| `secretPassphrase`     | `string`   | Passphrase used by `CryptoJsService`          |
| `translationsURLs`     | `string[]` | Extra remote translation JSON URLs to fetch   |
| `ngCoreAssetsUrl`      | `string`   | Base URL to fetch the library's own assets    |

### Extending translations

Only `en` translations, English (`en-US`) Angular locale data and PrimeNG
translations are bundled in the library. Consuming applications add the
languages they need by subclassing three extension points and registering
them in `app.config.ts`. `projects/ng-core-tester` is the reference
implementation for this pattern — see
`projects/ng-core-tester/src/app/app-translate-loader.ts`,
`app-translate.service.ts` and `service/app-translate-language.service.ts`.

```typescript
// app-translate-loader.ts — add translation catalogs
import { Injectable } from '@angular/core';
import { CORE_TRANSLATION_LOADERS, CoreTranslateLoader, TranslationLoaderFn } from '@rero/ng-core';

const appI18n = (lang: string): TranslationLoaderFn =>
  () => fetch(`/assets/i18n/${lang}.json`).then(r => r.json()).then(data => ({ default: data }));

@Injectable()
export class AppTranslateLoader extends CoreTranslateLoader {
  protected override coreTranslationLoaders: Record<string, TranslationLoaderFn> = {
    ...CORE_TRANSLATION_LOADERS,
    fr: appI18n('fr'),
    de: appI18n('de'),
  };
}
```

```typescript
// app-translate.service.ts — add Angular locale data + PrimeNG translations
import { Injectable } from '@angular/core';
import { CORE_LOCALES, Locales, NgCoreTranslateService } from '@rero/ng-core';
import localeFr from '@angular/common/locales/fr';
import fr from 'primelocale/js/fr.js';

@Injectable({ providedIn: 'root' })
export class AppTranslateService extends NgCoreTranslateService {
  protected override locales: Locales = {
    ...CORE_LOCALES,
    fr: { angular: localeFr, primeng: fr },
  };
}
```

Register everything in `app.config.ts`:

```typescript
import { provideTranslateLoader, provideTranslateService, TranslateService } from '@ngx-translate/core';
import { NgCoreTranslateService } from '@rero/ng-core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(),
    provideTranslateService({ loader: provideTranslateLoader(AppTranslateLoader) }),
    { provide: TranslateService, useExisting: AppTranslateService },
    { provide: NgCoreTranslateService, useExisting: AppTranslateService },
  ],
};
```

Angular locale modules and PrimeNG translations are compiled JS modules
that must be statically imported — dynamic import paths built from
template literals are rejected by esbuild at build time, so each language
must be listed explicitly as shown above.

## Public API

### Core pipes

* `Nl2brPipe` — convert carriage returns into `<br>` HTML tags.
* `FilesizePipe` — format a byte count as a human-readable file size.
* `TruncateTextPipe` — truncate a string to a given length.
* `UcfirstPipe` — uppercase the first letter of a string.
* `MarkdownPipe` — render Markdown to HTML.
* `CallbackArrayFilterPipe` — filter an array with a callback function.

### Core components

* `DialogComponent` — dialog modal for alerts or confirmations.
* `SearchInputComponent` — search input emitting an event on submit.
* `ErrorComponent` — generic error display.
* `ReadMoreComponent` — collapsible text block.

### Core services

* `CoreConfigService` — library configuration, meant to be subclassed.
* `HttpPendingService` — tracks in-flight HTTP mutations (paired with
  `httpPendingInterceptor`) to guard against double form submits.
* `LocalStorageService` — typed wrapper around `localStorage`.
* `CryptoJsService` — encrypt/decrypt helper using `secretPassphrase`.
* `ComponentCanDeactivateGuard` / `AbstractCanDeactivateComponent` — route
  guard pair for unsaved-changes confirmation.
* `PageTitleStrategy` — sets the page title from route data.

### Translate

* `NgCoreTranslateService` — wraps `@ngx-translate/core`'s
  `TranslateService`, `luxon` locale settings and PrimeNG translations.
* `CoreTranslateLoader` — extensible `TranslateLoader` (see above).
* `TranslateLanguageService` — resolves a language code to its display
  name in the current locale; also extensible per app.
* `TranslateLanguagePipe` — pipe wrapping `TranslateLanguageService`.
* `DateTranslatePipe` — formats a date using the current locale.

### Formly

Field types (`ArrayComponent`, `ObjectComponent`, `MultischemaComponent`,
`SwitchComponent`, `RadioButtonComponent`, `TreeSelectComponent`,
`MultiCheckboxComponent`, `InputComponent`, `MultiSelectComponent`,
`SelectComponent`, `DatePickerComponent`, `TextareaComponent`,
`MarkdownComponent`, `RemoteAutocompleteComponent`,
`PasswordGeneratorComponent`), wrappers (`HideWrapperComponent`,
`CardWrapperComponent`, `FormFieldWrapperComponent`) and editor helpers
(`LabelComponent`, `DropdownLabelEditorComponent`,
`AddFieldEditorComponent`), registered through `withNgCoreFormly()`
(used internally by `provideCore()`).

### Record

Components and services to search, display and edit Invenio records:
`RecordSearchPageComponent`, `RecordSearchComponent`,
`RecordSearchResultComponent`, `AggregationComponent` and its
sub-aggregations, `SearchFiltersComponent`, `SearchTabsComponent`,
`PaginatorComponent`, `DetailComponent`, `DetailButtonComponent`,
`EditorComponent`, `RecordService`, `RecordUiService`,
`RecordHandleErrorService`, `ApiService`, `GetRecordPipe`.

See `projects/ng-core-tester` for complete, working examples of every
integration point described above.

## Installing a local version of the library

Sometimes it's useful not to use the version published on the npm
registry, but a local one. There are two ways to do this.

### With pnpm link

The lighter choice is to use the `pnpm link` command. It creates a
symbolic link to the built library directly in your project's
`node_modules`, pointing at your local `dist/rero/ng-core` folder.

To do this, build the library first:

```
$ cd /path/to/ng-core/project
$ pnpm run build-lib
```

Then, from your project, link to the built output:

```
$ cd /path/to/your-project/
$ pnpm link /path/to/ng-core/project/dist/rero/ng-core
```

This solution is the simplest, but the `ng test` command will fail as
the tester doesn't resolve the symlink.

### With a packed tarball

This is the closest way to install the library, as it mirrors installing
it from the npm registry. The command generates a tarball file containing
the built library.

```
$ cd /path/to/ng-core/project
$ pnpm run pack
```

This creates a file named **rero-ng-core-X.X.X.tgz** at the repository
root. Then, in your project, install the file with your package manager,
e.g. with pnpm:

```
$ cd /path/to/your-project/
$ pnpm add /path/to/tarball/file/rero-ng-core-X.X.X.tgz
```

## Test the library

To test the library:

```
$ git clone https://github.com/rero/ng-core.git
$ cd ng-core
$ pnpm install
$ pnpm run build-lib
$ pnpm exec ng serve --open # in another terminal
```

This will launch the `ng-core-tester` application, which contains
examples for using every functionality of the library.
