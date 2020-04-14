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

import {
  TooltipModule,
  TypeaheadModule,
  PaginationModule,
  CollapseModule,
  BsDatepickerModule
} from 'ngx-bootstrap';

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
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { GetRecordPipe } from '../pipe/get-record.pipe';
import { CoreModule } from '../core.module';
import { EditorComponent } from './editor/editor.component';
import { AddFieldEditorComponent } from './editor/add-field-editor/add-field-editor.component';
import { DropdownLabelEditorComponent } from './editor/dropdown-label-editor/dropdown-label-editor.component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import * as messages from './editor/validation-messages';
import { ArrayTypeComponent } from './editor/array-type/array-type.component';
import { ObjectTypeComponent } from './editor/object-type/object-type.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { SwitchComponent } from './editor/switch/switch.component';
import { MultiSchemaTypeComponent } from './editor/multischema/multischema.component';
import { DatepickerTypeComponent } from './editor/type/datepicker-type.component';
import {ToggleWrapperComponent} from './editor/toggle-wrapper/toggle-wrappers.component';
import { hooksFormlyExtension } from './editor/extensions';
import { BucketsComponent } from './search/aggregation/buckets/buckets.component';


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
    BucketsComponent
  ],
  imports: [
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    RecordRoutingModule,
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    PaginationModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    BsDatepickerModule.forRoot(),
    FormlyModule.forRoot({
      extensions: [{ name: 'hooks', extension: hooksFormlyExtension }],
      validationMessages: [
        { name: 'required', message: _('This field is required') },
        { name: 'null', message: _('should be null') },
        { name: 'minlength', message: messages.minlengthValidationMessage },
        { name: 'maxlength', message: messages.maxlengthValidationMessage },
        { name: 'min', message: messages.minValidationMessage },
        { name: 'max', message: messages.maxValidationMessage },
        { name: 'multipleOf', message: messages.multipleOfValidationMessage },
        {
          name: 'exclusiveMinimum',
          message: messages.exclusiveMinimumValidationMessage
        },
        {
          name: 'exclusiveMaximum',
          message: messages.exclusiveMaximumValidationMessage
        },
        { name: 'minItems', message: messages.minItemsValidationMessage },
        { name: 'maxItems', message: messages.maxItemsValidationMessage },
        { name: 'uniqueItems', message: _('should NOT have duplicate items') },
        {
          name: 'alreadyTakenMessage',
          message: _('the value is already taken')
        },
        { name: 'const', message: messages.constValidationMessage }
      ],
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
        { name: 'datepicker', component: DatepickerTypeComponent }
      ],
      wrappers: [
        { name: 'toggle-switch', component: ToggleWrapperComponent }
      ]
    }),
    FormlyBootstrapModule
  ],
  exports: [
    RecordSearchComponent,
    AutocompleteComponent,
    GetRecordPipe,
    CoreModule,
    EditorComponent,
    FormlyModule,
    FormlyBootstrapModule
  ],
  entryComponents: [
    JsonComponent,
    DetailJsonComponent,
    AutocompleteComponent
  ]
})
export class RecordModule {}
