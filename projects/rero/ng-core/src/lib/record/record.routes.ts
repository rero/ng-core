// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';

import { DetailComponent } from './component/detail/detail.component';
import { RecordSearchPageComponent } from './component/search/record-search-page.component';

export const typeResolver: ResolveFn<string> = (route) => {
  return route.params['type'];
};

/**
 * Resolve the record types from the closest parent route defining them.
 */
export const inheritTypesResolver: ResolveFn<unknown> = (route: ActivatedRouteSnapshot) => {
  let r: ActivatedRouteSnapshot | null = route.parent;
  while (r) {
    if (r.data['types']) return r.data['types'];
    r = r.parent;
  }
  return [];
};

/**
 * Search and detail routes; the editor routes are in `@rero/ng-core/editor`.
 */
export const ngCoreRoutes: Routes = [
  {
    path: ':type',
    title: typeResolver,
    component: RecordSearchPageComponent,
  },
  {
    path: ':type/detail/:pid',
    title: typeResolver,
    component: DetailComponent,
    resolve: { types: inheritTypesResolver },
  },
];
