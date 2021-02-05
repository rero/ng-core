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
import { ActivatedRoute, RouterModule, ROUTES, Routes } from '@angular/router';
import { CoreRouterModule } from '@rero/ng-core';
import { RouteToolsService } from '../service/route-tools-service';
import { EditorComponent } from './editor/editor.component';
import { BackendAdminRoute } from './routes/backend-admin-route';
import { DocumentsGlobalsRoute } from './routes/documents-globals-route';
import { DocumentsRoute } from './routes/documents-route';
import { DocumentsUnisiRoute } from './routes/documents-unisi-route';
import { OrganisationsRoute } from './routes/organisations-route';
import { RecordModuleRoutes } from './routes/record-module-route';

const routes: Routes = [
  {
    path: 'editor',
    component: EditorComponent
  }
];

const providersRoutes: any[] = [
  { provide: ROUTES, useClass: RecordModuleRoutes, multi: true },
  { provide: ROUTES, useClass: DocumentsGlobalsRoute, multi: true, deps: [RouteToolsService] },
  { provide: ROUTES, useClass: DocumentsUnisiRoute, multi: true, deps: [RouteToolsService] },
  { provide: ROUTES, useClass: BackendAdminRoute, multi: true, deps: [RouteToolsService] },
  { provide: ROUTES, useClass: DocumentsRoute, multi: true, deps: [RouteToolsService] },
  { provide: ROUTES, useClass: OrganisationsRoute, multi: true, deps: [RouteToolsService, ActivatedRoute] }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CoreRouterModule.forChild(providersRoutes)
  ],
  exports: [RouterModule, CoreRouterModule]
})
export class RecordRouterModule {
}
