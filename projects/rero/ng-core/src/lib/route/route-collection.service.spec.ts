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
import { TestBed } from '@angular/core/testing';
import { RouteCollectionService } from './route-collection.service';
import { IRoute } from './route-interface';

class RouteMock implements IRoute {
  name = 'routeMock';
  priority = 0;

  getConfiguration() {
    return { route: this.name };
  }
}

describe('RoutingCollectionService', () => {
  let routeCollectionService: RouteCollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    routeCollectionService = TestBed.inject(RouteCollectionService);
  });

  it('should be created', () => {
    expect(routeCollectionService).toBeTruthy();
  });

  it('GetRoute return the correct route added', () => {
    const routeMock = new RouteMock();
    routeCollectionService.addRoute(routeMock);
    expect(routeCollectionService.getRoute('routeMock')).toEqual(routeMock);
  });

  it('DeleteRoute return true', () => {
    const routeMock = new RouteMock();
    routeCollectionService.addRoute(routeMock);
    expect(routeCollectionService.size()).toBe(1);
    expect(routeCollectionService.deleteRoute('routeMock')).toBeTruthy();
  });

  it('GetRoutes return all route(s) added', () => {
    const routeMock = new RouteMock();
    routeCollectionService.addRoute(routeMock);
    expect(routeCollectionService.getRoutes().length).toBe(1);
    expect(routeCollectionService.getRoutes()[0]).toEqual({ route: 'routeMock' });
  });

  it('availableRoutesName return all route names', () => {
    const routeMock = new RouteMock();
    routeCollectionService.addRoute(routeMock);
    expect(routeCollectionService.availableRoutesName()).toEqual(['routeMock']);
  });
});
