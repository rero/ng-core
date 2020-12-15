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
import { Router, RouterModule } from '@angular/router';
import { RouteFactoryService, routeToken } from '@rero/ng-core';
import { BaseRoute } from './routes/base-route';

/**
 * Routing module for application.
 */
@NgModule({
  imports: [RouterModule.forRoot([])],
  exports: [RouterModule],
  providers: [
    { provide: routeToken, useClass: BaseRoute, multi: true },
  ]
})
export class AppRoutingModule {
  /**
   * Constructor
   * @param _router - Router
   * @param routerFactoryService - RouteFactoryService
   */
  constructor(
    private _router: Router,
    private routerFactoryService: RouteFactoryService
    ) {
      /**
       * Use the resetConfig function only on the main application.
       * To add other routes in different modules, use "router.config.push".
       */
    _router.resetConfig(routerFactoryService.createRoutes());
  }
}
