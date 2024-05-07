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
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CoreModule } from '../core.module';
import { GetRecordPipe } from '../pipe/get-record.pipe';
import { emailValidator } from '../validator/email.validator';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { DetailButtonComponent } from './detail/detail-button/detail-button.component';
import { DetailComponent } from './detail/detail.component';
import { RecordDetailDirective } from './detail/detail.directive';
import { JsonComponent as DetailJsonComponent } from './detail/view/json.component';
import { EditorComponent } from './editor/editor.component';
import { registerNgCoreFormlyExtension } from './editor/extensions';
import { NgCoreFormlyFieldInput, NgCoreFormlyInputModule } from './editor/formly/primeng/input';
import { ArrayTypeComponent } from './editor/type/array-type/array-type.component';
import { CustomSelectFieldComponent } from './editor/type/custom-select/custom-select.component';
import { DateTimepickerTypeComponent } from './editor/type/date-time-picker-type.component';
import { DatepickerTypeComponent } from './editor/type/datepicker-type.component';
import { MarkdownFieldComponent } from './editor/type/markdown/markdown.component';
import { MultiSelectComponent } from './editor/type/multi-select/multi-select.component';
import { MultiCheckboxComponent } from './editor/type/multicheckbox.component';
import { MultiSchemaTypeComponent } from './editor/type/multischema/multischema.component';
import { ObjectTypeComponent } from './editor/type/object-type/object-type.component';
import { PasswordGeneratorTypeComponent } from './editor/type/password-generator-type.component';
import { RadioButtonComponent } from './editor/type/radio-button.component';
import { RemoteTypeaheadComponent } from './editor/type/remote-typeahead/remote-typeahead.component';
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
import { HorizontalWrapperComponent } from './editor/wrappers/horizontal-wrapper/horizontal-wrapper.component';
import { ToggleWrapperComponent } from './editor/wrappers/toggle-wrapper/toggle-wrappers.component';
import { ExportButtonComponent } from './export-button/export-button.component';
import { FileComponent } from './files/file/file.component';
import { RecordFilesComponent } from './files/files.component';
import { RecordRoutingModule } from './record-routing.module';
import { RecordService } from './record.service';
import { RecordSearchAggregationComponent } from './search/aggregation/aggregation.component';
import { BucketsComponent } from './search/aggregation/buckets/buckets.component';
import { AggregationDateRangeComponent } from './search/aggregation/date-range/date-range.component';
import { ListFiltersComponent } from './search/aggregation/list-filters/list-filters.component';
import { BucketNamePipe } from './search/aggregation/pipe/bucket-name.pipe';
import { AggregationSliderComponent } from './search/aggregation/slider/slider.component';
import { RecordSearchPageComponent } from './search/record-search-page.component';
import { RecordSearchComponent } from './search/record-search.component';
import { JsonComponent } from './search/result/item/json.component';
import { RecordSearchResultComponent } from './search/result/record-search-result.component';
import { RecordSearchResultDirective } from './search/result/record-search-result.directive';

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
        AutocompleteComponent,
        GetRecordPipe,
        EditorComponent,
        AddFieldEditorComponent,
        DropdownLabelEditorComponent,
        ArrayTypeComponent,
        ObjectTypeComponent,
        SwitchComponent,
        MultiSchemaTypeComponent,
        DatepickerTypeComponent,
        ToggleWrapperComponent,
        BucketsComponent,
        HorizontalWrapperComponent,
        FormFieldWrapperComponent,
        HideWrapperComponent,
        AggregationSliderComponent,
        RemoteTypeaheadComponent,
        RecordFilesComponent,
        LoadTemplateFormComponent,
        SaveTemplateFormComponent,
        CardWrapperComponent,
        LabelComponent,
        TextareaFieldComponent,
        CustomSelectFieldComponent,
        MarkdownFieldComponent,
        AggregationDateRangeComponent,
        ExportButtonComponent,
        ListFiltersComponent,
        BucketNamePipe,
        DateTimepickerTypeComponent,
        PasswordGeneratorTypeComponent,
        MultiCheckboxComponent,
        FileComponent,
        DetailButtonComponent,
        RadioButtonComponent,
        MultiSelectComponent
    ],
    imports: [
        // NOTE : BrowserAnimationModule **should** be include in application core module.
        // BrowserAnimationsModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        RecordRoutingModule,
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        TypeaheadModule.forRoot(),
        PaginationModule.forRoot(),
        CollapseModule.forRoot(),
        PaginationModule.forRoot(),
        BsDatepickerModule.forRoot(),
        CalendarModule,
        ClipboardModule,
        RadioButtonModule,
        MultiSelectModule,
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
                { name: 'array', component: ArrayTypeComponent },
                { name: 'object', component: ObjectTypeComponent },
                { name: 'multischema', component: MultiSchemaTypeComponent },
                { name: 'datepicker', component: DatepickerTypeComponent },
                { name: 'selectWithSort', extends: 'select' },
                { name: 'remoteTypeahead', component: RemoteTypeaheadComponent },
                { name: 'textarea', component: TextareaFieldComponent },
                { name: 'select', component: CustomSelectFieldComponent },
                { name: 'markdown', component: MarkdownFieldComponent },
                { name: 'dateTimePicker', component: DateTimepickerTypeComponent },
                { name: 'passwordGenerator', component: PasswordGeneratorTypeComponent },
                { name: 'multicheckbox', component: MultiCheckboxComponent },
                { name: 'radioButton', component: RadioButtonComponent },
                { name: 'multiSelect', component: MultiSelectComponent }
            ],
            wrappers: [
                { name: 'toggle-switch', component: ToggleWrapperComponent },
                { name: 'form-field-horizontal', component: HorizontalWrapperComponent },
                { name: 'form-field', component: FormFieldWrapperComponent },
                { name: 'hide', component: HideWrapperComponent },
                { name: 'card', component: CardWrapperComponent }
            ]
        }),
        FormlyPrimeNGModule,
        FormlySelectModule,
        NgCoreFormlyInputModule
    ],
    exports: [
        RecordSearchComponent,
        AutocompleteComponent,
        GetRecordPipe,
        CoreModule,
        EditorComponent,
        FormlyModule,
        FormlyPrimeNGModule,
        FormlySelectModule,
        ExportButtonComponent,
        DetailButtonComponent,
        RecordDetailDirective,
        RecordFilesComponent
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
