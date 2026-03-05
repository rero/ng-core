/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { Injectable, computed, signal } from '@angular/core';
import { RouteInterface } from './route-interface';

@Injectable({
  providedIn: 'root'
})
export class RouteCollectionService {

  /**
   * Collection of routes (signal-based)
   */
  private readonly collection = signal<Map<string, RouteInterface>>(
    new Map()
  );

  /* --------------------------------------------------------------------------
   * Mutations
   * -------------------------------------------------------------------------- */

  addRoute(route: RouteInterface): this {
    const name = route.name;

    this.collection.update(map => {
      if (!map.has(name)) {
        const next = new Map(map);
        next.set(name, route);
        return next;
      }
      return map;
    });

    return this;
  }


  /* --------------------------------------------------------------------------
   * Queries (computed)
   * -------------------------------------------------------------------------- */

  getRoute(name: string) {
    return computed(() => this.collection().get(name));
  }

  /**
   * Get all routes configurations
   */
  routes = computed(() =>
    Array.from(this.collection().values()).map(route =>
      route.getConfiguration()
    )
  );

}
