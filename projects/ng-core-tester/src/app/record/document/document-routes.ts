/*
 * RERO angular core
 * Copyright (C) 2026 RERO
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

import { ngCoreRoutes } from "@rero/ng-core";
import { DocumentsRoute } from "../../routes/documents-route";
import { ResolveFn, Routes } from "@angular/router";
import { RecordType } from "projects/rero/ng-core/src/lib/record/model";

export const typesDocumentResolver: ResolveFn<Partial<RecordType>[]> = () => {
  return new DocumentsRoute().getTypes();
};

export const routes: Routes = [
  {
    path: 'search',
    children: ngCoreRoutes,
    resolve: {
      types: typesDocumentResolver,
    },
    data: {
      showSearchInput: true,
    }
  },
];
