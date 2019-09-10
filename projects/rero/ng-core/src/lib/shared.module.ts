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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ToastrModule } from 'ngx-toastr';

import { TranslateLoader } from './translate/translate-loader';
import { AlertComponent } from './alert/alert.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { Nl2brPipe } from './pipe/nl2br.pipe';
import { TranslateLanguagePipe } from './translate-language/translate-language.pipe';
import { DefaultPipe } from './pipe/default.pipe';
import { TruncateTextPipe } from './pipe/truncate-text.pipe';
import { UpperCaseFirstPipe } from './pipe/ucfirst.pipe';
import { DialogComponent } from './dialog/dialog.component';

@NgModule({
  declarations: [
    AlertComponent,
    DialogComponent,
    SearchInputComponent,
    Nl2brPipe,
    DefaultPipe,
    TruncateTextPipe,
    TranslateLanguagePipe,
    UpperCaseFirstPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    AlertModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    ToastrModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader,
      },
      isolate: false
    })
  ],
  exports: [
    CommonModule,
    FormsModule,
    PaginationModule,
    BsDropdownModule,
    TranslateModule,
    AlertComponent,
    DialogComponent,
    SearchInputComponent,
    Nl2brPipe,
    DefaultPipe,
    TruncateTextPipe,
    TranslateLanguagePipe,
    UpperCaseFirstPipe
  ],
  entryComponents: [
    DialogComponent
  ]
})
export class SharedModule { }
