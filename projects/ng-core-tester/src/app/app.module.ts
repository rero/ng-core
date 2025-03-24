/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import {
  CoreConfigService,
  primeNGConfig,
  RecordModule,
  RecordService,
  RemoteAutocompleteService,
  TranslateLoader,
} from '@rero/ng-core';
import { providePrimeNG } from 'primeng/config';
import { MenubarModule } from 'primeng/menubar';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { AppConfigService } from './app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppDialogComponent } from './home/dialog/app-dialog.component';
import { HomeComponent } from './home/home.component';
import { ToastComponent } from './home/toast/toast.component';
import { MenuComponent } from './menu/menu.component';
import { DetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { EditorComponent } from './record/editor/editor.component';
import { RecordServiceMock } from './record/editor/record-service-mock';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { AppRemoteAutocompleteService } from './service/app-remote-autocomplete.service';

@NgModule({
  declarations: [
    AppComponent,
    AppDialogComponent,
    DetailComponent,
    DocumentComponent,
    EditorComponent,
    HomeComponent,
    MenuComponent,
    SearchBarComponent,
    ToastComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    MenubarModule,
    RecordModule,
    RippleModule,
    TagModule,
    TranslateModule.forRoot({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader,
        deps: [CoreConfigService, HttpClient],
      },
    }),
  ],
  providers: [
    {
      provide: CoreConfigService,
      useClass: AppConfigService,
    },
    {
      provide: RecordService,
      useClass: RecordServiceMock,
    },
    {
      provide: RemoteAutocompleteService,
      useClass: AppRemoteAutocompleteService,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG(primeNGConfig)
  ],
})
export class AppModule {}
