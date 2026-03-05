/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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

import { ResolveFn, Routes } from "@angular/router";
import { RecordSearchPageComponent } from "./component/search/record-search-page.component";
import { DetailComponent } from "./component/detail/detail.component";
import { EditorComponent } from "./editor/component/editor/editor.component";

export const typeResolver: ResolveFn<string> = (route) => {
  return route.params["type"];
};

export const ngCoreRoutes: Routes = [
  {
    path: ':type',
    title: typeResolver,
    component: RecordSearchPageComponent
  },
  {
    path: ':type/new',
    title: typeResolver,
    component: EditorComponent
  },
  {
    path: ':type/detail/:pid',
    title: typeResolver,
    component: DetailComponent
  },
  {
    path: ':type/edit/:pid',
    component: EditorComponent
  },
];
