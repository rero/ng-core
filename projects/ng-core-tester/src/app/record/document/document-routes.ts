// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ResolveFn, Routes } from "@angular/router";
import { ngCoreRoutes, RecordType } from "@rero/ng-core";
import { DocumentsRoute } from "../../routes/documents-route";

export const typesDocumentResolver: ResolveFn<Partial<RecordType>[]> = () => {
  return new DocumentsRoute().getTypes();
};

export const routes: Routes = [
  {
    path: 'search',
    children: ngCoreRoutes,
    resolve: {
      types: typesDocumentResolver,
    },
    data: {
      showSearchInput: true,
    }
  },
];
