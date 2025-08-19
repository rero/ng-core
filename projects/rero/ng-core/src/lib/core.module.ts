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
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, NgModule, provideAppInitializer } from '@angular/core';
import { RouterModule, TitleStrategy } from '@angular/router';
import { TranslateLoader as BaseTranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { CoreConfigService } from './core-config.service';
import { DialogComponent } from './dialog/dialog.component';
import { ErrorComponent } from './error/error.component';
import { ComponentCanDeactivateGuard } from './guard/component-can-deactivate.guard';
import { CallbackArrayFilterPipe } from './pipe/callback-array-filter.pipe';
import { DefaultPipe } from './pipe/default.pipe';
import { FilesizePipe } from './pipe/filesize.pipe';
import { MarkdownPipe } from './pipe/markdown.pipe';
import { Nl2brPipe } from './pipe/nl2br.pipe';
import { SanitizePipe } from './pipe/sanitize.pipe';
import { SortByKeysPipe } from './pipe/sort-by-keys.pipe';
import { TruncateTextPipe } from './pipe/truncate-text.pipe';
import { UpperCaseFirstPipe } from './pipe/ucfirst.pipe';
import { PrimeNgCoreModule } from './prime-ng-core-module';
import { SearchInputComponent } from './search-input/search-input.component';
import { PageTitleStrategy } from './service/page-title-strategy';
import { TextReadMoreComponent } from './text-read-more/text-read-more.component';
import { DateTranslatePipe } from './translate/date-translate-pipe';
import { TranslateLanguagePipe } from './translate/translate-language.pipe';
import { TranslateLoader } from './translate/translate-loader';
import { NgCoreTranslateService } from './translate/translate-service';
import { KatexDirective } from './directive/katex.directive';
import { ReadMoreComponent } from './read-more/read-more.component';

@NgModule({
    declarations: [
        Nl2brPipe,
        DefaultPipe,
        TruncateTextPipe,
        UpperCaseFirstPipe,
        CallbackArrayFilterPipe,
        DateTranslatePipe,
        DialogComponent,
        ReadMoreComponent,
        SearchInputComponent,
        TranslateLanguagePipe,
        TextReadMoreComponent,
        SortByKeysPipe,
        ErrorComponent,
        FilesizePipe,
        MarkdownPipe,
        SanitizePipe,
        KatexDirective
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
        NgxSpinnerModule,
        PrimeNgCoreModule
    ],
    exports: [
        PrimeNgCoreModule,
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
        ReadMoreComponent,
        SearchInputComponent,
        TextReadMoreComponent,
        ErrorComponent,
        SortByKeysPipe,
        NgxSpinnerModule,
        MarkdownPipe,
        SanitizePipe,
        KatexDirective
    ],
    providers: [
      provideAppInitializer(() => {
        const translateService = inject(NgCoreTranslateService);
        translateService.initialize();
        return of(true);
      }),
      { provide: TranslateService, useClass: NgCoreTranslateService },
      { provide: TitleStrategy, useClass: PageTitleStrategy },
      ComponentCanDeactivateGuard,
      ConfirmationService,
      MessageService,
      SanitizePipe
    ]
})
export class CoreModule { }
