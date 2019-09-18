import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecordSearchComponent } from './search/record-search.component';
import { EditorComponent } from './editor/editor.component';
import { DetailComponent } from './detail/detail.component';

const routes: Routes = [
  { path: ':type', component: RecordSearchComponent },
  { path: ':type/detail/:pid', component: DetailComponent },
  { path: ':type/edit/:pid', component: EditorComponent },
  { path: ':type/new', component: EditorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordRoutingModule { }
