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

import { CoreModule, RecordModule, SharedModule } from '@rero/ng-core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentComponent } from './record/document/document.component';
import { InstitutionComponent } from './record/institution/institution.component';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './record/document/detail/detail.component';
import { CoreConfigService } from '@rero/ng-core';
import { AppConfigService } from './app-config.service';
import { CollapseModule, TypeaheadModule } from 'ngx-bootstrap';
import { SearchBarComponent } from './search-bar/search-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    DocumentComponent,
    InstitutionComponent,
    HomeComponent,
    DetailComponent,
    SearchBarComponent
  ],
  imports: [
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    CollapseModule.forRoot(),
    RecordModule,
    TypeaheadModule.forRoot()
  ],
  providers: [
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    DocumentComponent,
    InstitutionComponent
  ]
})
export class AppModule { }
