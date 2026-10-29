<!--
SPDX-FileCopyrightText: Fondation RERO+
SPDX-License-Identifier: AGPL-3.0-or-later
-->

# RERO angular core library

This library provides standalone components, services, pipes and providers
for common usage in Angular projects. It has no `NgModule` — everything is
consumed either as a standalone import or through a `provide*` function
registered in your application's `providers` array.

The library is split into entry points, so that an application only bundles,
and only installs the dependencies of, the parts it uses:

| Entry point                     | Content                                                                                 | Setup                               | Optional peer dependencies       |
| ------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------- |
| `@rero/ng-core`                 | Core components, pipes, guards and configuration; translation; record search and detail | `provideCore()`                     | —                                |
| `@rero/ng-core/editor`          | Record editor, Formly field types, wrappers and extensions                              | `provideCoreFormly()`               | `@ngx-formly/core`               |
| `@rero/ng-core/barcode-scanner` | Barcode and QR code scanner                                                             | `provideCore(withBarcodeScanner())` | `barcode-detector`, `zxing-wasm` |
| `@rero/ng-core/katex`           | `KatexDirective`, LaTeX rendering                                                       | —                                   | `katex`                          |

The main entry point never imports the other ones: an application that does
not use the editor, the scanner or KaTeX does not need to install their
dependencies.

## Requirements

- Node.js 24 or bigger (see `.github/workflows/main.yml` for the version
  used in CI)
- Angular 22 (standalone APIs, zoneless change detection)

## Installation

To install this library, simply do:

```
$ pnpm add @rero/ng-core
```

Then install the optional peer dependencies of the entry points you use,
e.g. `pnpm add @ngx-formly/core` for the editor.

## Configuration

Register `provideCore()` in your application's providers. This wires up
the Optimus UI dialog/message/confirmation services, the page title
strategy and the translate service used by the library.

Applications displaying forms (the record editor or their own Formly
forms) also register `provideCoreFormly()`, from the `@rero/ng-core/editor`
entry point, which provides the Formly field types, wrappers, extensions
and validation messages. Read-only applications (search and detail views
only) never import `@rero/ng-core/editor`: Formly is then not included in
their bundle, and `@ngx-formly/core` does not need to be installed.

`provideCore()` does not provide Optimus UI's own configuration nor
`HttpClient` — those remain your application's responsibility, as shown in
`projects/ng-core-tester/src/app/app.config.ts`. The library does not use
`@angular/animations`: no animation provider is needed.

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideOptimus } from '@openng/optimus-ui/config';
import { optimusUIConfig, provideCore } from '@rero/ng-core';
import { withBarcodeScanner } from '@rero/ng-core/barcode-scanner';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCore(withBarcodeScanner()), // or provideCore() without the scanner
    provideOptimus(optimusUIConfig),
    provideHttpClient(),
    // ...your other providers
  ],
};
```

Register `provideCoreFormly()` in the application providers only if forms
are displayed everywhere; otherwise register it on the routes that display
forms (see [Editor](#editor-rerong-coreeditor)).

### Optimus UI and CSS layers

`optimusUIConfig` puts the Optimus UI styles in the `optimus` CSS layer,
ordered `theme, base, optimus, utilities`, so that the Tailwind utility
classes (`core:` in the library) override the component styles. Optimus UI
writes this order in a `<style data-optimus-style-id="layer-order">`
element, which it creates if the page has none.

When the host page declares its own layers (e.g. the templates of an
Invenio backend), it must list `optimus` before `utilities` and provide the
placeholder before its stylesheets:

```html
<style>
  @layer bootstrap, theme, base, my-app, optimus, utilities;
</style>
<style type="text/css" data-optimus-style-id="layer-order"></style>
```

A layer missing from this declaration is appended last, with the highest
priority: the Optimus UI component styles then override everything else.

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
import { CoreConfigService } from '@rero/ng-core';

import { AppConfigService } from './app-config.service';

export const appConfig: ApplicationConfig = {
  providers: [provideCore(), { provide: CoreConfigService, useExisting: AppConfigService }],
};
```

`CoreConfigService` fields (see
`src/lib/core/service/core-config/core-config.service.ts` for the
authoritative source):

| Field                 | Type                           | Purpose                                          |
| --------------------- | ------------------------------ | ------------------------------------------------ |
| `production`          | `boolean`                      | Production flag                                  |
| `projectTitle`        | `string`                       | Used by `PageTitleStrategy`                      |
| `apiBaseUrl`          | `string`                       | Base URL for the Invenio API                     |
| `apiEndpointPrefix`   | `string`                       | API path prefix (default `/api`)                 |
| `$refPrefix`          | `string`                       | Prefix stripped from `$ref` URLs                 |
| `schemaFormEndpoint`  | `string`                       | Endpoint serving JSON schemas                    |
| `defaultLanguage`     | `string`                       | Fallback language (default `en`)                 |
| `translationsURLs`    | `(string \| TranslationURL)[]` | Extra remote translation JSON URLs to fetch      |
| `translationsVersion` | `string`                       | Version appended to `versioned` translation URLs |
| `ngCoreAssetsUrl`     | `string`                       | Base URL to fetch the library's own assets       |

A translation URL declared as `{ url, versioned: true }` points to a static
file: the loader appends `?v=<translationsVersion>` and allows the browser
HTTP cache for it, so a new version is fetched after each deployment. Plain
string URLs (e.g. API endpoints) are always fetched from the server.

```typescript
this.translationsVersion = environment.translationsVersion;
this.translationsURLs = [{ url: '/assets/i18n/${lang}.json', versioned: true }, '/api/translations/${lang}.json'];
```

### Extending translations

Only `en` translations, English (`en-US`) Angular locale data and Optimus UI
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

const appI18n =
  (lang: string): TranslationLoaderFn =>
  () =>
    fetch(`/assets/i18n/${lang}.json`)
      .then((r) => r.json())
      .then((data) => ({ default: data }));

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
// app-translate.service.ts — add Angular locale data + Optimus UI translations
import localeFr from '@angular/common/locales/fr';
import { Injectable } from '@angular/core';
import { fr } from '@openng/optimus-ui-locale/js/fr.js';
import { CORE_LOCALES, Locales, NgCoreTranslateService } from '@rero/ng-core';

@Injectable({ providedIn: 'root' })
export class AppTranslateService extends NgCoreTranslateService {
  protected override locales: Locales = {
    ...CORE_LOCALES,
    fr: { angular: localeFr, optimusUI: fr },
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

Angular locale modules and Optimus UI translations are compiled JS modules
that must be statically imported — dynamic import paths built from
template literals are rejected by esbuild at build time, so each language
must be listed explicitly as shown above.

## Barcode scanner setup

The barcode scanner lives in the `@rero/ng-core/barcode-scanner`
secondary entry point. Its dependencies, `barcode-detector` and
`zxing-wasm`, are optional peer dependencies: install them only when the
scanner is used.

The scanner of the Formly input fields (`barcodeScanner` prop) is
displayed only when it is enabled in `provideCore()`; otherwise it is left
out of the application bundle:

```typescript
import { withBarcodeScanner } from '@rero/ng-core/barcode-scanner';

provideCore(withBarcodeScanner()),
```

`BarcodeScannerComponent` can also be used directly in a template,
without this feature.

`BarcodeScannerComponent` decodes barcodes and QR codes using
[`barcode-detector`](https://www.npmjs.com/package/barcode-detector)'s
ZXing WebAssembly ponyfill. That WASM binary
(`zxing_reader.wasm`, shipped in the `zxing-wasm` package, itself a
dependency of `barcode-detector`) is fetched at runtime from
`ngCoreAssetsUrl` (the origin root when empty) — it cannot be bundled by
`ng-packagr` inside the library, so every consuming application must
copy it to its build output root itself.

Add this entry to the `assets` array of your application's build
target in `angular.json`:

```json
{
  "glob": "zxing_reader.wasm",
  "input": "node_modules/zxing-wasm/dist/reader",
  "output": "."
}
```

When the application is not served from the origin root, set
`ngCoreAssetsUrl` in `CoreConfigService` to the URL of its build output
root.

Without this entry, opening the scanner dialog fails silently: the
camera preview starts, but no barcode is ever detected (a 404 for
`zxing_reader.wasm` appears in the browser console).

## KaTeX setup

`KatexDirective` renders the LaTeX expressions of its host element. It
lives in the `@rero/ng-core/katex` secondary entry point, and `katex` is
an optional peer dependency: install it only when the directive is used.

```typescript
import { KatexDirective } from '@rero/ng-core/katex';
```

Its styles are in `assets/scss/katex.scss`.

## Public API

### Core pipes

- `Nl2brPipe` — convert carriage returns into `<br>` HTML tags.
- `FilesizePipe` — format a byte count as a human-readable file size.
- `TruncateTextPipe` — truncate a string to a given length.
- `UcfirstPipe` — uppercase the first letter of a string.
- `MarkdownPipe` — render Markdown to HTML.
- `CallbackArrayFilterPipe` — filter an array with a callback function.

### Core components

- `DialogComponent` — dialog modal for alerts or confirmations.
- `SearchInputComponent` — search input emitting an event on submit.
- `ErrorComponent` — generic error display.
- `ReadMoreComponent` — collapsible text block.
- `BarcodeScannerComponent` (`@rero/ng-core/barcode-scanner`) — button
  opening a dialog that scans a barcode or QR code from the device's
  camera (see [Barcode scanner setup](#barcode-scanner-setup) above for a
  required build configuration step).

### Core services

- `CoreConfigService` — library configuration, meant to be subclassed.
- `HttpPendingService` — tracks in-flight HTTP mutations (paired with
  `httpPendingInterceptor`) to guard against double form submits.
- `noCacheInterceptor` — forces the browser to revalidate `GET`/`HEAD`
  responses with the server instead of serving them from its HTTP cache;
  register it with `provideHttpClient(withInterceptors([noCacheInterceptor]))`
  and set the `ALLOW_HTTP_CACHE` context token to `true` to keep the cache
  for a request.
- `LocalStorageService` — typed wrapper around `localStorage`, storing
  dated JSON values.
- `unsavedChangesGuard` / `AbstractUnsavedChangesComponent` — route
  guard pair for unsaved-changes confirmation.
- `PageTitleStrategy` — sets the page title from route data.

### Translate

- `NgCoreTranslateService` — wraps `@ngx-translate/core`'s
  `TranslateService`, `luxon` locale settings and Optimus UI translations.
- `CoreTranslateLoader` — extensible `TranslateLoader` (see above).
- `TranslateLanguageService` — resolves a language code to its display
  name in the current locale; also extensible per app.
- `TranslateLanguagePipe` — pipe wrapping `TranslateLanguageService`.
- `DateTranslatePipe` — formats a date using the current locale.

### Editor (`@rero/ng-core/editor`)

The record editor and the Formly integration live in the
`@rero/ng-core/editor` secondary entry point.

Field types (`ArrayComponent`, `ObjectComponent`, `MultischemaComponent`,
`SwitchComponent`, `RadioButtonComponent`, `TreeSelectComponent`,
`MultiCheckboxComponent`, `InputComponent`, `MultiSelectComponent`,
`SelectComponent`, `DatePickerComponent`, `TextareaComponent`,
`MarkdownComponent`, `RemoteAutocompleteComponent`,
`PasswordGeneratorComponent`), wrappers (`HideWrapperComponent`,
`CardWrapperComponent`, `FormFieldWrapperComponent`) and editor helpers
(`LabelComponent`, `DropdownLabelEditorComponent`,
`AddFieldEditorComponent`), registered through `provideCoreFormly()`.

The editor itself: `EditorComponent`, `SaveTemplateFormComponent`,
`LoadTemplateFormComponent`, `JSONSchemaService`, `TemplatesService`,
`processJsonSchema()`, `resolve$ref()`.

`ngCoreEditorRoutes` holds the `:type/new` and `:type/edit/:pid` routes
and provides the Formly configuration itself. Loading it lazily keeps the
editor and Formly out of the initial bundle:

```typescript
{
  path: 'records',
  children: [
    ...ngCoreRoutes,
    { path: '', loadChildren: () => import('@rero/ng-core/editor').then((m) => m.ngCoreEditorRoutes) },
  ],
}
```

The same applies to the application's own routes: register
`provideCoreFormly()` in the `providers` of the lazily loaded routes that
display forms, instead of registering it in the application providers:

```typescript
// my-records.routes.ts, loaded with loadChildren
import { Routes } from '@angular/router';
import { EditorComponent, provideCoreFormly, RemoteAutocompleteService } from '@rero/ng-core/editor';

export const myRecordsRoutes: Routes = [
  {
    path: '',
    providers: [provideCoreFormly(), { provide: RemoteAutocompleteService, useClass: MyAutocompleteService }],
    children: [
      { path: 'new', component: EditorComponent },
      { path: 'edit/:pid', component: EditorComponent },
    ],
  },
];
```

Lazy loading only works if no eagerly loaded code imports
`@rero/ng-core/editor`: a single import, even of a service, pulls the whole
editor, Formly and their Optimus UI components into the initial bundle. In
particular:

- override `RemoteAutocompleteService` in the route providers, as above,
  not in `app.config.ts`;
- keep the files of the lazy routes apart from what `app.routes.ts` imports
  (e.g. their resolvers): a route file imported statically is not lazy;
- load a dialog that displays a form with a dynamic `import()`, from a
  component of a route that provides Formly — the dialog then gets the
  Formly configuration from that route.

### Record

Components and services to search and display Invenio records:
`RecordSearchPageComponent`, `RecordSearchComponent`,
`RecordSearchResultComponent`, `AggregationComponent` and its
sub-aggregations, `SearchFiltersComponent`, `SearchTabsComponent`,
`PaginatorComponent`, `DetailComponent`, `DetailButtonComponent`,
`RecordService`, `RecordUiService`, `RecordHandleErrorService`,
`ApiService`, `GetRecordPipe`, and `ngCoreRoutes` (search and detail
routes).

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
root. Then, in your project, declare it as an override in
`pnpm-workspace.yaml` and reinstall:

```yaml
overrides:
  '@rero/ng-core': 'file:../ng-core/rero-ng-core-X.X.X.tgz'
```

```
$ cd /path/to/your-project/
$ pnpm install
```

A plain `pnpm add` of the tarball does not last: pnpm 12 reinstalls the
dependencies before `pnpm run` and restores the published version. After
packing a new build with the same version, run `pnpm install --force`.
Do not commit the override.

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
