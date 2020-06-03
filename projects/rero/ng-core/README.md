# RERO angular core library

This library provides modules, components, services and pipes for common usage in projects.

The library embed two main modules, CoreModule and RecordModule. RecordModule imports CoreModule to use pipes and components from it.

## Core module

Core module integrates some components and pipes usable in each angular projects.

## Record module

Record module is a specific module to interact with Invenio resources. It provides CRUD functionalities for managing records.

### Components

These components can be found in core module: 

* DialogComponent: A component allowing to show a dialog modal, for displaying an alert or force user to confirm an action.
* SearchInputComponent: A component to display a search input and emit an event when search is submitted.
* MenuComponent: A component for displaying a navigation list, based on a configuration object.

Pipes: 

* TranslateLanguagePipe: Display full name of a language code for the given locale.
* DateTranslatePipe: Display a date in the language given by a locale.
* UpperCaseFirstPipe: Uppercase the first letter of the given string.
* TruncateTextPipe: Return the string truncated in the given limit.
* Nl2brPipe: Convert carriage returns into `<br>` html tags.
* DefaultPipe: Returns a default value if input value is empty.
* CallbackArrayFilterPipe: Filter an array by a callback function.

Services: 

* ApiService: Service for configuring calls to a remote API.
* CoreConfigService: Service for configuring the library behavior.
* TranslateLanguageService: Service for translating languages.
* TranslateService: Service for initializing translations (ngx-translate).

## TranslateService

TranslateService is a proxy service for configuring translations with ngx-translate, BsLocaleService (ngx-bootstrap) and momentjs. During initialization, it sets the default language defined in configuration for all of them. 

Language can be changed for all dependencies by calling : 

```
TranslateService::setLanguage(language:string)
```

The translations loader can be easily overriden as explained in the [ngx-translate documentation](https://github.com/ngx-translate/core#aot).
Here's an example to do this: 

```
// translate-loader.ts
import { Inject } from '@angular/core';
import { of } from 'rxjs';
import { TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';

export class CustomTranslateLoader extends NgCoreTranslateLoader {
  private translations: object = {
    fr: {
      'Welcome': 'Bienvenue
    },
    de: {
      'Welcome': 'Willkommen
    }
  };

  /**
   * Return observable used by ngx-translate to get translations.
   * @param lang - string, language to rerieve translations from.
   */
  getTranslation(lang: string): Observable<any> {
    if (!this.translations[lang]) {
      throw new Error(`Translations not found for lang "${lang}"`);
    }
    
    return of(this.translations[lang]);
  }
}

// app.module.ts
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CustomTranslateLoader } from 'translate-loader';

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
      }
    })
  ]
})
```


## How to use

### Requirements

* node version 11 or bigger

### Installation

To install this library, simply do: 

```
$ npm i --save @rero/ng-core
```

### Configuration

First of all, you have to add modules to *app.module.ts:* 

```
import { RecordModule } from '@rero/ng-core';

@NgModule({
  imports: [
    RecordModule # Or CoreModule if you don't want to manage Invenio resources
  ]
})
```

Next, create a service extending CoreConfigService for storing configuration data: 

```
import { Injectable } from '@angular/core';
import { CoreConfigService } from '@rero/ng-core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService extends CoreConfigService {
  constructor() {
    super();
    this.production = false;
    this.apiBaseUrl = 'https://localhost:5000';
    this.schemaFormEndpoint = '/api/schemaform';
    this.$refPrefix = 'https://test.ch';
    this.languages = [ 'fr', 'de', 'en' ];
    this.customTranslations = {};
  }
}
```

Finally, override CoreConfigService with the new one in *app.module.ts*: 

```
import { AppConfigService } from './app-config.service';

@NgModule({
  providers: [
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    }
  ]
})
```

### Installing a local version of the library

Sometimes, it's wanted not to use the version published on NPM registry, but a local one. To do this, there's two choices.

#### With npm link
The lighter choice is to use the npm link command. It creates a symbolic link in the **global node_modules** folder and use this link in the project in which the library is used.

To do this, build the library and create the global symlink:
```
$ cd /path/to/ng-core/project
$ ng build @rero/ng-core
$ cd dist/rero/ng-core
$ npm link
```

Then in the project, add the link to the library: 
```
$ cd /path/to/your-project/
$ npm link @rero/ng-core
```

This solution is the most simple, but the *ng test* command will fail as the tester doesn't resolve the symlink.

#### With npm pack

This is the closest way to install the library, as it is done with npm registry. 

The command generates a zipped tarball file containing the library.

The steps to do this are the following: 

```
$ cd /path/to/ng-core/project
$ ng build @rero/ng-core
$ cd dist/rero/ng-core
$ npm pack
```

This will create a file named **rero-ng-core-X.X.X.tgz**. Then, go to the project and install the file: 

```
$ cd /path/to/your-project/
$ npm i /path/to/tarball/file/rero-ng-core-X.X.X.tgz
```

## Test the library

To test the library : 

```
$ git clone https://github.com/rero/ng-core.git
$ cd ng-core
$ npm install
$ ng build @rero/ng-core
$ ng serve --open # in another terminal
```

This will launch the tester application, which contains examples for using functionalities.
