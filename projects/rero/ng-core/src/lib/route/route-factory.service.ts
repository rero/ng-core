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
import { Injectable, InjectionToken, Injector } from '@angular/core';
import { RouteCollectionService } from './route-collection.service';
import { IRoute } from './route-interface';

/** Route Token */
export const routeToken = new InjectionToken<IRoute[]>
  ('IRoute');

@Injectable({
  providedIn: 'root'
})
export class RouteFactoryService {

  /**
   * Constructor
   * @param _injector - Injector
   * @param _routeCollection - RouteCollectionService
   */
  constructor(
    public injector: Injector,
    public routeCollection: RouteCollectionService,
    ) { }

  /** Create all routes */
  createRoutes() {
    /** Load all routes with IRoute interface */
    try {
      const routes = this.injector.get(routeToken);
      console.log('createRoutes', routes);
      for (const route of routes) {
        this.routeCollection.addRoute(route);
      }
    } catch (THROW_IF_NOT_FOUND) {}
    return this.routeCollection.getRoutes();
  }
}
