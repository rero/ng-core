/*
 * RERO angular core
 * Copyright (C) 2021 RERO
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

import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { ROUTES } from '@angular/router';
import { IRoute } from '@rero/ng-core/public-api';
import { RouteCollectionService } from './route/route-collection.service';
import { RouteFactoryService } from './route/route-factory.service';

// export function routesFactory(injector: Injector): RouteFactoryService {
//   return new RouteFactoryService(injector, new RouteCollectionService());
// }

@NgModule({
  // providers: [
  //   { provide: ROUTES, useFactory: routesFactory, multi: true, deps: [Injector] }
  // ]
})
export class CoreRouterModule {
  /**
   * Creates and configures a module with all the router providers and directives.
   * Optionally sets up an application listener to perform an initial navigation.
   *
   * When registering the NgModule at the root, import as follows:
   *
   * ```
   * @NgModule({
   *   imports: [CoreRouterModule.forRoot(ROUTES)]
   * })
   * class MyNgModule {}
   * ```
   *
   * @param routes An array of `Route` objects that define the navigation paths for the application.
   * @param config An `ExtraOptions` configuration object that controls how navigation is performed.
   * @return The new `NgModule`.
   *
   */
  static forRoot(routesProviders: any[]): ModuleWithProviders<CoreRouterModule> {
    console.log('forRoot', routesProviders);
    return {
      ngModule: CoreRouterModule,
      providers: [
        provideRoutes(routesProviders)
    ]};
  }


  /**
   * Creates a module with all the router directives and a provider registering routes,
   * without creating a new Router service.
   * When registering for submodules and lazy-loaded submodules, create the NgModule as follows:
   *
   * ```
   * @NgModule({
   *   imports: [CoreRouterModule.forChild(ROUTES)]
   * })
   * class MyNgModule {}
   * ```
   *
   * @param routes An array of `Route` objects that define the navigation paths for the submodule.
   * @return The new NgModule.
   *
   */
  static forChild(routesProviders: any[]): ModuleWithProviders<CoreRouterModule> {
    console.log('forChild', routesProviders);
    return { ngModule: CoreRouterModule, providers: provideRoutes(routesProviders) };
  }
}

/**
 * Registers a [DI provider](guide/glossary#provider) for a set of routes.
 * @param routes The route configuration to provide.
 *
 * @usageNotes
 *
 * ```
 * @NgModule({
 *   imports: [RouterModule.forChild(ROUTES)],
 *   providers: [provideRoutes(EXTRA_ROUTES)]
 * })
 * class MyNgModule {}
 * ```
 *
 * @publicApi
 */
export function provideRoutes(routes: any[]): any {
  const pRoutes = [];
  routes.forEach((route: IRoute) => {
    console.log(route);
    pRoutes.push(route.getConfiguration());
  });
  return [
    {provide: ROUTES, multi: true, useValue: pRoutes},
  ];
}
