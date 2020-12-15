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
import { IRoute } from './route-interface';

@Injectable({
  providedIn: 'root'
})
export class RouteCollectionService {

  /**
   * Collection of routes
   */
  _collection = new Map();

  /**
   * Add route on collection
   * @param route - IRoute or IRouteRouter
   * @param priority - number, level of priority
   * @return this - RouteCollectionService
   */
  addRoute(route: IRoute): RouteCollectionService {
    const routeName = route.name;
    if (!this.hasRoute(routeName)) {
      this._collection.set(routeName, route);
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
      this._collection.delete(name);
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
    return this._collection.has(name);
  }

  /**
   * Get route by name
   * @param name - string
   * @return mixed - RouteInterface | null
   */
  getRoute(name: string): IRoute | null {
    if (this.hasRoute(name)) {
      return this._collection.get(name);
    }
    return null;
  }

  /**
   * Get All routes
   * @return array of routes
   */
  getRoutes(): any[] {
    const routes = [];
    const routesPriority = {};
    for (const value of this._collection.values()) {
      const priority = value.priority;
      if (!(priority in routesPriority)) {
        routesPriority[priority] = [];
      }
      routesPriority[priority].push(value);
    }
    const keys = Object.keys(routesPriority)
    .map((key: string) => Number(key))
    .sort((left: number, right: number) => right - left);
    for (const key of keys) {
      for (const routeDef of routesPriority[key]) {
        const routeDefConfig = routeDef.getConfiguration();
        if (routeDefConfig instanceof Array) {
          for (const route of routeDefConfig) {
            routes.push(route);
          }
        } else {
          routes.push(routeDefConfig);
        }
      }
    }
    return routes;
  }

  /**
   * Return a array of route name
   * @return array
   */
  availableRoutesName(): string[] {
    const routesName = [];
    for (const route of this._collection.keys()) {
      routesName.push(route);
    }
    return routesName;
  }

  /**
   * Count available routes
   * @return number;
   */
  size(): number {
    return this._collection.size;
  }

  /** Clear */
  clear(): void {
    this._collection = new Map();
  }
}
