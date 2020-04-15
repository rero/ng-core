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
import { Injectable } from '@angular/core';
import { RouteInterface } from './route-interface';

@Injectable({
  providedIn: 'root'
})
export class RouteCollectionService {

  /**
   * Collection of routes
   */
  private collection = new Map();

  /**
   * Add route on collection
   * @param route - RouteInterface
   * @return this - RouteCollectionService
   */
  addRoute(route: RouteInterface): RouteCollectionService {
    const routeName = route.name;
    if (!this.hasRoute(routeName)) {
      this.collection.set(routeName, route);
    }
    return this;
  }

  /**
   * Delete route on collection
   * @param name - string
   * @return boolean
   */
  deleteRoute(name: string): boolean {
    if (this.hasRoute(name)) {
      this.collection.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Check if route is present to the collection
   * @param name - string
   * @return boolean
   */
  hasRoute(name: string): boolean {
    return this.collection.has(name);
  }

  /**
   * Get route by name
   * @param name - string
   * @return mixed - RouteInterface | null
   */
  getRoute(name: string): RouteInterface | null {
    if (this.hasRoute(name)) {
      return this.collection.get(name);
    }
    return null;
  }

  /**
   * Get All routes
   * @return routes separated by comma
   */
  getRoutes() {
    const routes = [];
    for (const value of this.collection.values()) {
      routes.push(value.getConfiguration());
    }
    return routes;
  }

  /**
   * Return a array of route name
   * @return array
   */
  availableRoutesName() {
    const routesName = [];
    for (const route of this.collection.keys()) {
      routesName.push(route);
    }
    return routesName;
  }

  /**
   * Count available routes
   * @return number;
   */
  size() {
    return this.collection.size;
  }
}
