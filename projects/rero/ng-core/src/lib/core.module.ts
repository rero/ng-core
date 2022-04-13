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
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { CoreConfigService } from './core-config.service';
import { DialogComponent } from './dialog/dialog.component';
import { NgVarDirective } from './directives/ng-var.directive';
import { ErrorComponent } from './error/error.component';
import { MenuWidgetComponent } from './menu/menu-widget/menu-widget.component';
import { CallbackArrayFilterPipe } from './pipe/callback-array-filter.pipe';
import { DefaultPipe } from './pipe/default.pipe';
import { FilesizePipe } from './pipe/filesize.pipe';
import { MarkdownPipe } from './pipe/markdown.pipe';
import { Nl2brPipe } from './pipe/nl2br.pipe';
import { SortByKeysPipe } from './pipe/sort-by-keys.pipe';
import { TruncateTextPipe } from './pipe/truncate-text.pipe';
import { UpperCaseFirstPipe } from './pipe/ucfirst.pipe';
import { SearchInputComponent } from './search-input/search-input.component';
import { TextReadMoreComponent } from './text-read-more/text-read-more.component';
import { DateTranslatePipe } from './translate/date-translate-pipe';
import { TranslateLanguagePipe } from './translate/translate-language.pipe';
import { TranslateLoader } from './translate/translate-loader';
import { MenuComponent } from './widget/menu/menu.component';
import { SortListComponent } from './widget/sort-list/sort-list.component';
import { AutofocusDirective } from './directives/autofocus.directive';

@NgModule({
  declarations: [
    Nl2brPipe,
    DefaultPipe,
    TruncateTextPipe,
    UpperCaseFirstPipe,
    CallbackArrayFilterPipe,
    DateTranslatePipe,
    DialogComponent,
    SearchInputComponent,
    MenuComponent,
    TranslateLanguagePipe,
    TextReadMoreComponent,
    SortByKeysPipe,
    ErrorComponent,
    FilesizePipe,
    MenuWidgetComponent,
    SortListComponent,
    NgVarDirective,
    MarkdownPipe,
    AutofocusDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule.forChild({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader,
        deps: [CoreConfigService, HttpClient]
      }
    }),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot(),
    NgxSpinnerModule
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
    FilesizePipe,
    DialogComponent,
    SearchInputComponent,
    MenuComponent,
    TextReadMoreComponent,
    ErrorComponent,
    SortByKeysPipe,
    NgxSpinnerModule,
    MenuWidgetComponent,
    SortListComponent,
    NgVarDirective,
    MarkdownPipe,
    AutofocusDirective
  ],
  entryComponents: [DialogComponent]
})
export class CoreModule { }
