/*
 * Invenio angular core
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
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RouteCollectionService } from '@rero/ng-core';
import { DocumentsRoute } from './documents-route';

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  /**
   * Constructor
   * @param routeCollectionService - RouteCollectionService
   * @param router - Router
   * @param routeToolService - RouteToolService
   */
  constructor(
    private routeCollectionService: RouteCollectionService,
    private router: Router
  ) { }

  /**
   * Initialize routes
   */
  initializeRoutes() {
    this.routeCollectionService
      .addRoute(new DocumentsRoute());

    this.routeCollectionService.getRoutes().map((route: any) => {
      this.router.config.push(route);
    });
  }
}
