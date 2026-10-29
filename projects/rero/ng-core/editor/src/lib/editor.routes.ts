// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Routes } from '@angular/router';
import { inheritTypesResolver, typeResolver } from '@rero/ng-core';

import { EditorComponent } from './editor/component/editor/editor.component';
import { provideCoreFormly } from './formly/config/formly.provider';

/**
 * Editor routes, to use next to `ngCoreRoutes`. They provide the Formly
 * configuration, so they can be loaded lazily with the whole editor:
 *
 * `loadChildren: () => import('@rero/ng-core/editor').then((m) => m.ngCoreEditorRoutes)`
 */
export const ngCoreEditorRoutes: Routes = [
  {
    path: '',
    providers: [provideCoreFormly()],
    children: [
      {
        path: ':type/new',
        title: typeResolver,
        component: EditorComponent,
      },
      {
        path: ':type/edit/:pid',
        component: EditorComponent,
        resolve: { types: inheritTypesResolver },
      },
    ],
  },
];
