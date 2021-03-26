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

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule, FORMLY_CONFIG } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { TranslateService } from '@ngx-translate/core';
import { NgxBootstrapSliderModule } from 'ngx-bootstrap-slider';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CoreModule } from '../core.module';
import { GetRecordPipe } from '../pipe/get-record.pipe';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { DetailComponent } from './detail/detail.component';
import { RecordDetailDirective } from './detail/detail.directive';
import { JsonComponent as DetailJsonComponent } from './detail/view/json.component';
import { EditorComponent } from './editor/editor.component';
import { registerNgCoreFormlyExtension } from './editor/extensions';
import { EditorService } from './editor/services/editor.service';
import { ArrayTypeComponent } from './editor/type/array-type/array-type.component';
import { DatepickerTypeComponent } from './editor/type/datepicker-type.component';
import { MultiSchemaTypeComponent } from './editor/type/multischema/multischema.component';
import { ObjectTypeComponent } from './editor/type/object-type/object-type.component';
import { RemoteTypeaheadComponent } from './editor/type/remote-typeahead/remote-typeahead.component';
import { SelectWithSortTypeComponent } from './editor/type/select-with-sort-type.component';
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
import { RecordFilesComponent } from './files/files.component';
import { RecordRoutingModule } from './record-routing.module';
import { RecordService } from './record.service';
import { RecordSearchAggregationComponent } from './search/aggregation/aggregation.component';
import { BucketsComponent } from './search/aggregation/buckets/buckets.component';
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
    SelectWithSortTypeComponent,
    RemoteTypeaheadComponent,
    RecordFilesComponent,
    LoadTemplateFormComponent,
    SaveTemplateFormComponent,
    CardWrapperComponent,
    LabelComponent,
    TextareaFieldComponent
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
    FormlyModule.forRoot({
      extras: {
        resetFieldOnHide: true,
        lazyRender: true
      },
      types: [
        { name: 'string', extends: 'input' },
        {
          name: 'number',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number'
            }
          }
        },
        {
          name: 'integer',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number'
            }
          }
        },
        { name: 'boolean', component: SwitchComponent },
        { name: 'enum', extends: 'select' },
        { name: 'array', component: ArrayTypeComponent },
        { name: 'object', component: ObjectTypeComponent },
        { name: 'multischema', component: MultiSchemaTypeComponent },
        { name: 'datepicker', component: DatepickerTypeComponent },
        { name: 'selectWithSort', component: SelectWithSortTypeComponent },
        { name: 'remoteTypeahead', component: RemoteTypeaheadComponent },
        { name: 'textarea', component: TextareaFieldComponent }
      ],
      wrappers: [
        { name: 'toggle-switch', component: ToggleWrapperComponent },
        { name: 'form-field-horizontal', component: HorizontalWrapperComponent },
        { name: 'form-field', component: FormFieldWrapperComponent },
        { name: 'hide', component: HideWrapperComponent },
        { name: 'card', component: CardWrapperComponent }
      ]
    }),
    FormlyBootstrapModule,
    NgxBootstrapSliderModule,
    FormlySelectModule
  ],
  exports: [
    RecordSearchComponent,
    AutocompleteComponent,
    GetRecordPipe,
    CoreModule,
    EditorComponent,
    FormlyModule,
    FormlyBootstrapModule,
    FormlySelectModule
  ],
  entryComponents: [
    JsonComponent,
    DetailJsonComponent,
    AutocompleteComponent,
    LoadTemplateFormComponent,
    SaveTemplateFormComponent
  ],
  providers: [
    {
      provide: FORMLY_CONFIG,
      multi: true,
      useFactory: registerNgCoreFormlyExtension,
      deps: [TranslateService, EditorService, RecordService]
    }
  ]
})
export class RecordModule { }
