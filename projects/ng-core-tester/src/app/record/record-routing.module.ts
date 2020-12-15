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

import { Injector, NgModule } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, Routes, ROUTES } from '@angular/router';
import { RouteCollectionService, RouteFactoryService, routeToken } from '@rero/ng-core';
import { RouteToolsService } from '../service/route-tools-service';
import { EditorComponent } from './editor/editor.component';
import { BackendAdminRoute } from './routes/backend-admin-route';
import { DocumentsGlobalsRoute } from './routes/documents-globals-route';
import { DocumentsRoute } from './routes/documents-route';
import { DocumentsUnisiRoute } from './routes/documents-unisi-route';
import { OrganisationsRoute } from './routes/organisations-route';
import { RecordModuleRoutes } from './routes/record-module-route';

export function routesFactory(injector: Injector): RouteFactoryService {
  return new RouteFactoryService(injector, new RouteCollectionService());
}

const routes: Routes = [
  {
    path: 'editor',
    component: EditorComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    { provide: ROUTES, useFactory: routesFactory, multi: true, deps: [Injector]},
    { provide: routeToken, useClass: RecordModuleRoutes, multi: true },
    { provide: routeToken, useClass: DocumentsGlobalsRoute, multi: true, deps: [RouteToolsService] },
    { provide: routeToken, useClass: DocumentsUnisiRoute, multi: true, deps: [RouteToolsService] },
    { provide: routeToken, useClass: BackendAdminRoute, multi: true, deps: [RouteToolsService] },
    { provide: routeToken, useClass: DocumentsRoute, multi: true, deps: [RouteToolsService] },
    { provide: routeToken, useClass: OrganisationsRoute, multi: true, deps: [RouteToolsService, ActivatedRoute] }
  ]
})
export class RecordRoutingModule {
  constructor(private _router: Router) {
    console.log('RecordRoutingModule', _router.config);
  }
}
