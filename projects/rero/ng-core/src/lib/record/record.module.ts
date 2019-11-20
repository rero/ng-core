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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { Bootstrap4FrameworkModule } from 'angular6-json-schema-form';
import { TooltipModule, TypeaheadModule, PaginationModule, CollapseModule } from 'ngx-bootstrap';

import { RecordRoutingModule } from './record-routing.module';
import { RecordSearchComponent } from './search/record-search.component';
import { RecordSearchComponent as RecordSearchPageComponent } from './search/record-search-page.component';
import { RecordSearchResultComponent } from './search/result/record-search-result.component';
import { RecordSearchResultDirective } from './search/result/record-search-result.directive';
import { RecordSearchAggregationComponent } from './search/aggregation/aggregation.component';
import { JsonComponent } from './search/result/item/json.component';
import { DetailComponent } from './detail/detail.component';
import { RecordDetailDirective } from './detail/detail.directive';
import { JsonComponent as DetailJsonComponent } from './detail/view/json.component';
import { EditorComponent } from './editor/editor.component';
import { Bootstrap4FrameworkComponent } from './editor/bootstrap4-framework/bootstrap4-framework.component';
import { FieldsetComponent } from './editor/fieldset/fieldset.component';
import { MefComponent } from './editor/mef/mef.component';
import { AddReferenceComponent } from './editor/add-reference/add-reference.component';
import { RemoteInputComponent } from './editor/remote-input/remote-input.component';
import { RemoteSelectComponent } from './editor/remote-select/remote-select.component';
import { RolesCheckboxesComponent } from './editor/roles-checkboxes/roles-checkboxes.component';
import { MainFieldsManagerComponent } from './editor/main-fields-manager/main-fields-manager.component';
import { SubmitComponent } from './editor/submit/submit.component';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { GetRecordPipe } from '../pipe/get-record.pipe';
import { Nl2brPipe } from '../pipe/nl2br.pipe';
import { DefaultPipe } from '../pipe/default.pipe';
import { TruncateTextPipe } from '../pipe/truncate-text.pipe';
import { TranslateLanguagePipe } from '../translate-language/translate-language.pipe';
import { UpperCaseFirstPipe } from '../pipe/ucfirst.pipe';
import { CallbackArrayFilterPipe } from '../pipe/callback-array-filter.pipe';
import { DateTranslatePipe } from '../translate/date-translate-pipe';
import { CoreModule } from '../core.module';
import { DialogComponent } from '../dialog/dialog.component';
import { SearchInputComponent } from '../search-input/search-input.component';
import { MenuComponent } from '../widget/menu/menu.component';

@NgModule({
  declarations: [
    RecordSearchPageComponent,
    RecordSearchComponent,
    RecordSearchResultComponent,
    RecordSearchResultDirective,
    RecordSearchAggregationComponent,
    JsonComponent,
    DetailComponent,
    RecordDetailDirective,
    DetailJsonComponent,
    EditorComponent,
    Bootstrap4FrameworkComponent,
    FieldsetComponent,
    MefComponent,
    AddReferenceComponent,
    RemoteInputComponent,
    RemoteSelectComponent,
    RolesCheckboxesComponent,
    MainFieldsManagerComponent,
    SubmitComponent,
    AutocompleteComponent,
    GetRecordPipe
  ],
  imports: [
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    RecordRoutingModule,
    Bootstrap4FrameworkModule,
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    PaginationModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot()
  ],
  exports: [
    DialogComponent,
    SearchInputComponent,
    MenuComponent,
    RecordSearchComponent,
    AutocompleteComponent,
    Nl2brPipe,
    DefaultPipe,
    TruncateTextPipe,
    TranslateLanguagePipe,
    UpperCaseFirstPipe,
    CallbackArrayFilterPipe,
    DateTranslatePipe,
    GetRecordPipe,
    CoreModule
  ],
  entryComponents: [
    JsonComponent,
    DetailJsonComponent,
    FieldsetComponent,
    MefComponent,
    Bootstrap4FrameworkComponent,
    AddReferenceComponent,
    RemoteInputComponent,
    RemoteSelectComponent,
    RolesCheckboxesComponent,
    MainFieldsManagerComponent,
    SubmitComponent,
    AutocompleteComponent,
    DialogComponent
  ]
})
export class RecordModule {}
