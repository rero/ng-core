// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { RecordSearchPageComponent } from './component/search/record-search-page.component';
import { DetailComponent } from './component/detail/detail.component';
import { EditorComponent } from './editor/component/editor/editor.component';

export const typeResolver: ResolveFn<string> = (route) => {
  return route.params['type'];
};

const inheritTypesResolver: ResolveFn<unknown> = (route: ActivatedRouteSnapshot) => {
  let r: ActivatedRouteSnapshot | null = route.parent;
  while (r) {
    if (r.data['types']) return r.data['types'];
    r = r.parent;
  }
  return [];
};

export const ngCoreRoutes: Routes = [
  {
    path: ':type',
    title: typeResolver,
    component: RecordSearchPageComponent,
  },
  {
    path: ':type/new',
    title: typeResolver,
    component: EditorComponent,
  },
  {
    path: ':type/detail/:pid',
    title: typeResolver,
    component: DetailComponent,
    resolve: { types: inheritTypesResolver },
  },
  {
    path: ':type/edit/:pid',
    component: EditorComponent,
    resolve: { types: inheritTypesResolver },
  },
];
