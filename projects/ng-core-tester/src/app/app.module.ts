/*
 * RERO angular core
 * Copyright (C) 2020 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, RecordModule, TranslateLoader } from '@rero/ng-core';
import { BsLocaleService, CollapseModule, TypeaheadModule } from 'ngx-bootstrap';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { deLocale, enGbLocale, frLocale, itLocale } from 'ngx-bootstrap/locale';
import { AppConfigService } from './app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    DocumentComponent,
    HomeComponent,
    DetailComponent,
    SearchBarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CollapseModule.forRoot(),
    TypeaheadModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader
      }
    }),
    RecordModule
  ],
  providers: [
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    },
    BsLocaleService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DocumentComponent
  ]
})
export class AppModule {
  availableLocales = {
    de: deLocale,
    en: enGbLocale,
    fr: frLocale,
    it: itLocale
  };
  constructor() {
    Object.keys(this.availableLocales).forEach(locale => {
      defineLocale(locale, this.availableLocales[locale]);
    });
  }
}
