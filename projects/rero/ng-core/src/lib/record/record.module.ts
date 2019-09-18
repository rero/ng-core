import { NgModule } from '@angular/core';
import { Bootstrap4FrameworkModule } from 'angular6-json-schema-form';

import { RecordRoutingModule } from './record-routing.module';
import { RecordSearchComponent } from './search/record-search.component';
import { RecordSearchResultComponent } from './search/result/record-search-result.component';
import { RecordSearchResultDirective } from './search/result/record-search-result.directive';
import { RecordSearchAggregationComponent } from './search/aggregation/aggregation.component';
import { JsonComponent } from './search/result/item/json.component';
import { SharedModule } from '../shared.module';
import { DetailComponent } from './detail/detail.component';
import { RecordDetailDirective } from './detail/detail.directive';
import { JsonComponent as DetailJsonComponent } from './detail/view/json.component';
import { EditorComponent } from './editor/editor.component';
import { Bootstrap4FrameworkComponent } from './editor/bootstrap4-framework/bootstrap4-framework.component';
import { FieldsetComponent } from './editor/fieldset/fieldset.component';
import { TooltipModule, TypeaheadModule } from 'ngx-bootstrap';
import { MefComponent } from './editor/mef/mef.component';
import { AddReferenceComponent } from './editor/add-reference/add-reference.component';
import { RemoteInputComponent } from './editor/remote-input/remote-input.component';
import { RemoteSelectComponent } from './editor/remote-select/remote-select.component';
import { RolesCheckboxesComponent } from './editor/roles-checkboxes/roles-checkboxes.component';
import { MainFieldsManagerComponent } from './editor/main-fields-manager/main-fields-manager.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
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
    MainFieldsManagerComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RecordRoutingModule,
    Bootstrap4FrameworkModule,
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot()
  ],
  exports: [
    RecordSearchComponent
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
    MainFieldsManagerComponent
  ]
})
export class RecordModule { }
