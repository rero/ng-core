/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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

import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FORMLY_CONFIG, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { TranslateService } from '@ngx-translate/core';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DataViewModule } from 'primeng/dataview';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CoreModule } from '../core.module';
import { GetRecordPipe } from '../pipe/get-record.pipe';
import { emailValidator } from '../validator/email.validator';
import { DetailButtonComponent } from './detail/detail-button/detail-button.component';
import { DetailComponent } from './detail/detail.component';
import { RecordDetailDirective } from './detail/detail.directive';
import { JsonComponent as DetailJsonComponent } from './detail/view/json.component';
import { EditorComponent } from './editor/editor.component';
import { registerNgCoreFormlyExtension } from './editor/extensions';
import { NgCoreFormlyDatePickerModule } from './editor/formly/primeng/date-picker/date-picker';
import { NgCoreFormlyFieldInput, NgCoreFormlyInputModule } from './editor/formly/primeng/input';
import { NgCoreFormlyMultiCheckboxModule } from './editor/formly/primeng/multi-checkbox/multi-checkbox';
import { NgCoreFormlyMultiSelectModule } from './editor/formly/primeng/multi-select/multi-select';
import { NgCoreFormlyRemoteAutocompleteModule } from './editor/formly/primeng/remote-autocomplete/remote-autocomplete';
import { NgCoreFormlySelectModule, SelectComponent } from './editor/formly/primeng/select/select';
import { NgCoreFormlyTreeSelectModule } from './editor/formly/primeng/tree-select/tree-select';
import { ArrayTypeComponent } from './editor/type/array-type/array-type.component';
import { MarkdownFieldComponent } from './editor/type/markdown/markdown.component';
import { MultiSchemaTypeComponent } from './editor/type/multischema/multischema.component';
import { ObjectTypeComponent } from './editor/type/object-type/object-type.component';
import { PasswordGeneratorTypeComponent } from './editor/type/password-generator-type.component';
import { RadioButtonComponent } from './editor/type/radio-button.component';
import { SwitchComponent } from './editor/type/switch/switch.component';
import { TextareaFieldComponent } from './editor/type/textarea/textarea.component';
import { AddFieldEditorComponent } from './editor/widgets/add-field-editor/add-field-editor.component';
import { DropdownLabelEditorComponent } from './editor/widgets/dropdown-label-editor/dropdown-label-editor.component';
import { LabelComponent } from './editor/widgets/label/label.component';
import { LoadTemplateFormComponent } from './editor/widgets/load-template-form/load-template-form.component';
import { SaveTemplateFormComponent } from './editor/widgets/save-template-form/save-template-form.component';
import { CardWrapperComponent } from './editor/wrappers/card-wrapper/card-wrapper.component';
import { FormFieldWrapperComponent } from './editor/wrappers/form-field-wrapper/form-field-wrapper.component';
import { HideWrapperComponent } from './editor/wrappers/hide-wrapper/hide-wrapper.component';
import { ExportButtonComponent } from './export-button/export-button.component';
import { RecordRoutingModule } from './record-routing.module';
import { RecordService } from './record.service';
import { SearchAutocompleteComponent } from './search-autocomplete/search-autocomplete.component';
import { RecordSearchAggregationComponent } from './search/aggregation/aggregation.component';
import { BucketsComponent } from './search/aggregation/buckets/buckets.component';
import { AggregationDateRangeComponent } from './search/aggregation/date-range/date-range.component';
import { ListFiltersComponent } from './search/aggregation/list-filters/list-filters.component';
import { BucketNamePipe } from './search/aggregation/pipe/bucket-name.pipe';
import { AggregationSliderComponent } from './search/aggregation/slider/slider.component';
import { MenuSortComponent } from './search/menu-sort/menu-sort.component';
import { PaginatorComponent } from './search/paginator/paginator.component';
import { RecordSearchPageComponent } from './search/record-search-page.component';
import { RecordSearchComponent } from './search/record-search.component';
import { JsonComponent } from './search/result/item/json.component';
import { RecordSearchResultComponent } from './search/result/record-search-result.component';
import { SearchFieldsComponent } from './search/search-fields/search-fields.component';
import { SearchFiltersComponent } from './search/search-filters/search-filters.component';
import { SearchTabsComponent } from './search/search-tabs/search-tabs.component';

@NgModule({
    declarations: [
        RecordSearchPageComponent,
        RecordSearchComponent,
        RecordSearchResultComponent,
        RecordSearchAggregationComponent,
        JsonComponent,
        DetailComponent,
        RecordDetailDirective,
        DetailJsonComponent,
        GetRecordPipe,
        EditorComponent,
        AddFieldEditorComponent,
        DropdownLabelEditorComponent,
        ArrayTypeComponent,
        ObjectTypeComponent,
        SwitchComponent,
        MultiSchemaTypeComponent,
        BucketsComponent,
        FormFieldWrapperComponent,
        HideWrapperComponent,
        AggregationSliderComponent,
        LoadTemplateFormComponent,
        SaveTemplateFormComponent,
        CardWrapperComponent,
        LabelComponent,
        TextareaFieldComponent,
        MarkdownFieldComponent,
        AggregationDateRangeComponent,
        ExportButtonComponent,
        ListFiltersComponent,
        BucketNamePipe,
        PasswordGeneratorTypeComponent,
        DetailButtonComponent,
        RadioButtonComponent,
        PaginatorComponent,
        MenuSortComponent,
        SearchFiltersComponent,
        SearchFieldsComponent,
        SearchTabsComponent,
        SearchAutocompleteComponent
    ],
    imports: [
        // NOTE : BrowserAnimationModule **should** be include in application core module.
        // BrowserAnimationsModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        RecordRoutingModule,
        DatePickerModule,
        DataViewModule,
        ClipboardModule,
        RadioButtonModule,
        AutoCompleteModule,
        FormlySelectModule,
        FormlyModule.forRoot({
            extensions: [
                { name: 'email', extension: { prePopulate: emailValidator } }
            ],
            extras: {
                checkExpressionOn: 'changeDetectionCheck',
                resetFieldOnHide: true
            },
            types: [
                { name: 'input', component: NgCoreFormlyFieldInput },
                { name: 'boolean', component: SwitchComponent },
                { name: 'enum', extends: 'select' },
                { name: 'array', component: ArrayTypeComponent, wrappers: ['card'] },
                { name: 'object', component: ObjectTypeComponent,  wrappers: ['card'] },
                { name: 'multischema', component: MultiSchemaTypeComponent},
                { name: 'textarea', component: TextareaFieldComponent },
                { name: 'select', component: SelectComponent },
                { name: 'markdown', component: MarkdownFieldComponent },
                { name: 'passwordGenerator', component: PasswordGeneratorTypeComponent },
                { name: 'radioButton', component: RadioButtonComponent },
            ],
            wrappers: [
                { name: 'form-field', component: FormFieldWrapperComponent },
                { name: 'hide', component: HideWrapperComponent },
                { name: 'card', component: CardWrapperComponent }
            ]
        }),
        FormlyPrimeNGModule,
        NgCoreFormlyDatePickerModule,
        NgCoreFormlyInputModule,
        NgCoreFormlyMultiCheckboxModule,
        NgCoreFormlyMultiSelectModule,
        NgCoreFormlyRemoteAutocompleteModule,
        NgCoreFormlySelectModule,
        NgCoreFormlyTreeSelectModule,
    ],
    exports: [
        RecordSearchComponent,
        GetRecordPipe,
        CoreModule,
        EditorComponent,
        FormlyModule,
        FormlyPrimeNGModule,
        FormlySelectModule,
        ExportButtonComponent,
        DetailButtonComponent,
        RecordDetailDirective,
        ListFiltersComponent,
        RecordSearchAggregationComponent,
        SearchFiltersComponent,
        SearchFieldsComponent,
        SearchAutocompleteComponent,
        NgCoreFormlyDatePickerModule,
        NgCoreFormlyInputModule,
        NgCoreFormlyMultiCheckboxModule,
        NgCoreFormlyRemoteAutocompleteModule,
        NgCoreFormlySelectModule,
        MenuSortComponent,
        NgCoreFormlyTreeSelectModule,
        SearchTabsComponent,
        PaginatorComponent
    ],
    providers: [
        {
            provide: FORMLY_CONFIG,
            multi: true,
            useFactory: registerNgCoreFormlyExtension,
            deps: [TranslateService, RecordService]
        }
    ]
})
export class RecordModule { }
