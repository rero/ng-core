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
import { TestBed } from '@angular/core/testing';

import { RouteCollectionService } from './route-collection.service';
import { RouteInterface } from './route-interface';

class RouteMock implements RouteInterface {

  name = 'routeMock';

  getConfiguration() {
    return { route: this.name };
  }
}

describe('RoutingCollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RouteCollectionService = TestBed.get(RouteCollectionService);
    expect(service).toBeTruthy();
  });

  it('GetRoute return the correct route added', () => {
    const service: RouteCollectionService = TestBed.get(RouteCollectionService);
    const routeMock = new RouteMock();
    service.addRoute(routeMock);
    expect(service.getRoute('routeMock')).toEqual(routeMock);
  });

  it('DeleteRoute return true', () => {
    const service: RouteCollectionService = TestBed.get(RouteCollectionService);
    const routeMock = new RouteMock();
    service.addRoute(routeMock);
    expect(service.size()).toBe(1);
    expect(service.deleteRoute('routeMock')).toBeTruthy();
  });

  it('GetRoutes return all route(s) added', () => {
    const service: RouteCollectionService = TestBed.get(RouteCollectionService);
    const routeMock = new RouteMock();
    service.addRoute(routeMock);
    expect(service.getRoutes().length).toBe(1);
    expect(service.getRoutes()[0]).toEqual({ route: 'routeMock' });
  });

  it('availableRoutesName return all route names', () => {
    const service: RouteCollectionService = TestBed.get(RouteCollectionService);
    const routeMock = new RouteMock();
    service.addRoute(routeMock);
    expect(service.availableRoutesName()).toEqual(['routeMock']);
  });
});
