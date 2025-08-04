/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { NgModule } from '@angular/core';
import { ResolveFn, RouterModule, Routes, UrlSegment } from '@angular/router';
import { ActionStatus, capitalize } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { EditorComponent } from './record/editor/editor.component';
import { RouteService } from './routes/route.service';

/**
 * Disallows access to admin functionalities.
 */
const adminModeCanNot = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

/**
 * Allows access to admin functionalities.
 */
const adminModeCan = (): Observable<ActionStatus> => {
  return of({
    can: true,
    message: ''
  });
};

/**
 * Whether user can add a record.
 */
const canAdd = (record: any): Observable<ActionStatus> => {
  return of({
    // can: Math.random() >= 0.5,
    can: true,
    message: ''
  });
};

/**
 * Whether user can update a record.
 */
const canUpdate = (record: any): Observable<ActionStatus> => {
  return of({
    // can: Math.random() >= 0.5,
    can: true,
    message: ''
  });
};

/**
 * Whether user can delete a record.
 */
const canDelete = (record: any): Observable<ActionStatus> => {
  return of({
    // can: Math.random() >= 0.5,
    can: true,
    message: `You <strong>cannot</strong> delete this record #${record.id} !`
  });
};

/**
 * Whether user can read a record.
 */
const canRead = (record: any): Observable<ActionStatus> => {
  return of({
    // can: Math.random() >= 0.5,
    can: true,
    message: ''
  });
};

/**
 * Wether files metadata can be updated.
 *
 * @param record Record.
 */
const canUpdateFilesMetadata = (): Observable<ActionStatus> => {
  return of({
    can: true,
    message: ''
  });
};

// Permissions override simple canRead, canUpdate and canDelete if defined
const permissions = (record: any) => {
  const perms = record.metadata.permissions;
  return of({
    canRead: {
      can: perms ? perms.read : true,
      message: '',
    },
    canUpdate: {
      can: perms ? perms.update : false,
      message: '',
    },
    canDelete: {
      can: perms ? perms.delete : false,
      message: 'This record cannot be deleted.',
    },
  });
};

/**
 * Custom treatment for aggregations.
 */
const aggregations = (agg: object) => {
  return of(agg);
};

/**
 * Filter files list (callback function called in Array.prototype.filter)
 */
const filterFilesList = (file: any): boolean => {
  return file.key.indexOf('.pdf') !== -1;
};

const orderFilesList = (a: any, b: any) => {
  if (a.metadata.order < b.metadata.order) {
    return -1;
  }
  if (a.metadata.order > b.metadata.order) {
    return 1;
  }
  return 0;
};

/**
 * Returned matched URL.
 *
 * @param url List of URL segments.
 * @return Object representing the matched URL.
 */
export function matchedUrl(url: UrlSegment[]) {
  const segments = [new UrlSegment(url[0].path, {})];

  return {
    consumed: segments,
    posParams: { type: new UrlSegment(url[1].path, {}) }
  };
}

/**
 * URL matchs document resource.
 *
 * @param url List of URL segments.
 * @return Object representing the matched URL.
 */
export function documentsMatcher(url: Array<UrlSegment>) {
  if (url[0].path === 'records' && url[1].path === 'documents') {
    return matchedUrl(url);
  }
  return null;
}

/**
 * URL matchs organisation resource.
 *
 * @param url List of URL segments.
 * @return Object representing the matched URL.
 */
export function organisationsMatcher(url: Array<UrlSegment>) {
  if (url[0].path === 'records' && url[1].path === 'organisations') {
    return matchedUrl(url);
  }
  return null;
}

export const titleEditorResolver: ResolveFn<string> = (route) => {
  // For translation, put this string "Editor > demo - edit" in the language dictionary.
  const edit = route.params.pid ? 'edit': 'add';
  return `Editor > ${capitalize(route.params["type"])} - ${edit}`;
};

/**
 * List of routes for application.
 */
const routes: Routes = [
  {
    path: '',
    title: 'Home',
    component: HomeComponent
  },
  {
    path: 'editor',
    children: [
      { path: ':type', component: EditorComponent, title: titleEditorResolver },
      { path: ':type/:pid', component: EditorComponent, title: titleEditorResolver }
    ],
    data: {
      types: [
        {
          key: 'demo',
          label: 'Demo',
          editorSettings: {
            longMode: true
          },
          component: DocumentComponent
        },
        {
          key: 'normal',
          label: 'normal',
          editorSettings: {
            longMode: false
          },
          component: DocumentComponent
        }
      ]
    }
  },
  {
    matcher: documentsMatcher,
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    title: 'Documents',
    data: {
      showSearchInput: true,
      adminMode: adminModeCanNot,
      types: [
        {
          key: 'documents',
          label: 'Documents',
          editorSettings: {
            longMode: true
          },
          component: DocumentComponent,
          noRecordMessage: 'No record at this time'
        }
      ]
    }
  },
  {
    matcher: organisationsMatcher,
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    title: 'Organisations',
    data: {
      showSearchInput: true,
      adminMode: adminModeCanNot,
      types: [
        {
          key: 'organisations',
          label: 'Organisations'
        }
      ]
    }
  },
  {
    path: 'unisi/record/search',
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    title: 'Documents',
    data: {
      showSearchInput: true,
      adminMode: adminModeCanNot,
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          preFilters: {
            organisation: 'unisi'
          }
        }
      ]
    }
  },
  {
    path: 'admin/record/search',
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    title: 'Documents',
    data: {
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          detailComponent: DetailComponent,
          editorSettings: {
            longMode: true
          },
          canAdd,
          canUpdate,
          canDelete,
          canRead,
          permissions,
          aggregations,
          adminMode: adminModeCan,
          aggregationsBucketSize: 8,
          aggregationsExpand: ['language'],
          aggregationsOrder: ['author', 'language'],
          listHeaders: {
            'Content-Type': 'application/rero+json'
          },
          itemHeaders: {
            'Content-Type': 'application/rero+json'
          },
          files: {
            enabled: true,
            filterList: filterFilesList,
            orderList: orderFilesList,
            infoExcludedFields: ['restriction', 'type'],
            canUpdateMetadata: canUpdateFilesMetadata
          },
          searchFields: [
            {
              label: 'Full-text',
              path: 'fulltext'
            },
            {
              label: 'Main title',
              path: 'title.mainTitle.value'
            }
          ],
          searchFilters: [
            {
              label: 'Advanced search',
              filter: 'simple',
              value: '0',
              /* If you set this value, the url parameter will still be present,
              but with different values */
              disabledValue: '1',
              persistent: true,
              url: {
                routerLink: ['/record', 'search', 'documents'],
                title: 'Link to search document'
              },
            },
            {
              label: 'Open access',
              filter: 'open_access',
              value: '1',
              url: {
                external: true,
                link: 'https://sonar.rero.ch',
                target: '_blank',
                title: 'Link to Sonar interface'
              },
              showIfQuery: true
            },
            {
              label: 'Another filter',
              filter: 'other',
              value: '1'
            },
            {
              label: 'Show Only',
              filters: [
                {
                  label: 'Online resources',
                  filter: 'online',
                  value: 'true',
                  showIfQuery: true
                },
                {
                  label: 'Physical resources',
                  filter: 'not_online',
                  value: 'true',
                  showIfQuery: true
                }
              ]
            }
          ],
          allowEmptySearch: true,
          sortOptions: [
            {
              label: 'Relevance',
              value: 'relevance',
              defaultQuery: true,
              icon: 'fa fa-sort-amount-desc'
            },
            {
              label: 'Date descending',
              value: 'newest',
              defaultNoQuery: true,
              icon: 'fa fa-sort-amount-desc'
            },
            {
              label: 'Date ascending',
              value: 'oldest',
              icon: 'fa fa-sort-amount-asc'
            },
            {
              label: 'Title',
              value: 'title',
              icon: 'fa fa-sort-alpha-asc'
            }
          ],
          exportFormats: [
            {
              label: 'CSV',
              url: 'CSV'
            },
            {
              label: 'TXT',
              url: 'txt'
            }
          ]
        },
        {
          key: 'organisations',
          label: 'Organisations',
          hideInTabs: false,
          sortOptions: [
            {
              label: 'Date descending',
              value: 'newest'
            },
            {
              label: 'Date ascending',
              value: 'oldest'
            }
          ]
        }
      ]
    }
  }
];

/**
 * Routing module for application.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule {

  constructor(private _routeService: RouteService) {
    this._routeService.initializeRoutes();
  }
}
