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
import { Injector } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouteCollectionService } from './route-collection.service';
import { routeToken, RouteFactoryService } from './route-factory.service';
import { IRoute } from './route-interface';


function baseRouteConfig() {
  return {
    path: '/records'
  };
}
class BaseRoute implements IRoute {
  name = 'base';
  priority = 0;

  getConfiguration() {
    return baseRouteConfig();
  }
}

describe('RouteFactoryService', () => {

  let routeFactoryService: RouteFactoryService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RouteFactoryService, useClass: RouteFactoryService, deps: [Injector, RouteCollectionService] },
        { provide: routeToken, useClass: BaseRoute, multi: true }
      ]
    });
    routeFactoryService = TestBed.inject(RouteFactoryService);
  }));

  it('should be created', () => {
    expect(routeFactoryService).toBeTruthy();
  });

  it('should create the routes', () => {
    expect(routeFactoryService.createRoutes()).toEqual([baseRouteConfig()]);
  });
});
