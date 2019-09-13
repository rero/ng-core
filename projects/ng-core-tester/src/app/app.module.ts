/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { CoreModule, Config, RecordModule, SharedModule } from '@rero/ng-core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { DocumentComponent } from './record/document/document.component';
import { InstitutionComponent } from './record/institution/institution.component';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './record/document/detail/detail.component';

const config: Config = {
  production: environment.production,
  apiBaseUrl: environment.apiBaseUrl,
  languages: environment.languages,
  customTranslations: environment.customTranslations
};

@NgModule({
  declarations: [
    AppComponent,
    DocumentComponent,
    InstitutionComponent,
    HomeComponent,
    DetailComponent
  ],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule.forRoot(config),
    RecordModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    DocumentComponent,
    InstitutionComponent
  ]
})
export class AppModule { }
