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
import { RouterModule } from '@angular/router';

import { TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';

import { Nl2brPipe } from './pipe/nl2br.pipe';
import { DefaultPipe } from './pipe/default.pipe';
import { TruncateTextPipe } from './pipe/truncate-text.pipe';
import { TranslateLanguagePipe } from './translate-language/translate-language.pipe';
import { UpperCaseFirstPipe } from './pipe/ucfirst.pipe';
import { CallbackArrayFilterPipe } from './pipe/callback-array-filter.pipe';
import { DateTranslatePipe } from './translate/date-translate-pipe';
import { DialogComponent } from './dialog/dialog.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { MenuComponent } from './widget/menu/menu.component';
import { TranslateLoader } from './translate/translate-loader';
import { ModalModule, BsDropdownModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    Nl2brPipe,
    DefaultPipe,
    TruncateTextPipe,
    TranslateLanguagePipe,
    UpperCaseFirstPipe,
    CallbackArrayFilterPipe,
    DateTranslatePipe,
    DialogComponent,
    SearchInputComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule.forChild({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader
      }
    }),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot()
  ],
  exports: [
    BsDropdownModule,
    CommonModule,
    TranslateModule,
    Nl2brPipe,
    DefaultPipe,
    TruncateTextPipe,
    TranslateLanguagePipe,
    UpperCaseFirstPipe,
    CallbackArrayFilterPipe,
    DateTranslatePipe,
    DialogComponent,
    SearchInputComponent,
    MenuComponent
  ],
  entryComponents: [DialogComponent]
})
export class CoreModule {}
