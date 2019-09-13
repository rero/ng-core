import { NgModule } from '@angular/core';

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


@NgModule({
  declarations: [
    RecordSearchComponent,
    RecordSearchResultComponent,
    RecordSearchResultDirective,
    RecordSearchAggregationComponent,
    JsonComponent,
    DetailComponent,
    RecordDetailDirective,
    DetailJsonComponent
  ],
  imports: [
    SharedModule,
    RecordRoutingModule
  ],
  exports: [
    RecordSearchComponent
  ],
  entryComponents: [
    JsonComponent,
    DetailJsonComponent
  ]
})
export class RecordModule { }
