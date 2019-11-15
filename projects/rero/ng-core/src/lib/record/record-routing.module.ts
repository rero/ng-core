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
import { Routes, RouterModule } from '@angular/router';

import { RecordSearchComponent } from './search/record-search-page.component';
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
