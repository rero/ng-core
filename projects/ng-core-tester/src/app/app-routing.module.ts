/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home/home.component';
import { DocumentComponent } from './record/document/document.component';
import { InstitutionComponent } from './record/institution/institution.component';
import { DetailComponent } from './record/document/detail/detail.component';
import { EditorComponent } from '@rero/ng-core';
import { RecordSearchComponent } from '@rero/ng-core';
import { DetailComponent as RecordDetailComponent } from '@rero/ng-core';

const canAdd = (record) => {
  return true;
};

const canUpdate = (record) => {
  return true;
};

const canDelete = (record) => {
  return of({
    can: Math.random() >= 0.5,
    message: `You <strong>cannot</strong> delete this record #${record.id} !`
  });
};

const aggregations = (agg: object) => {
  return of(agg);
};

export function matchedUrl(url: UrlSegment[]) {
  const segments = [
    new UrlSegment(url[0].path, {}),
    new UrlSegment(url[1].path, {})
  ];

  return {
    consumed: segments,
    posParams: { type: new UrlSegment(url[1].path, {}) }
  };
}

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    matcher: (url) => {
      if (url[0].path === 'records' && url[1].path === 'documents') {
        return matchedUrl(url);
      }
      return null;
    },
    children: [
      { path: '', component: RecordSearchComponent },
      { path: 'detail/:pid', component: RecordDetailComponent }
    ],
    data: {
      showSearchInput: true,
      adminMode: false,
      linkPrefix: 'records',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          preFilters: {
            institution: 'usi'
          }
        }
      ]
    }
  },
  {
    matcher: (url) => {
      if (url[0].path === 'records' && url[1].path === 'institutions') {
        return matchedUrl(url);
      }
      return null;
    },
    children: [
      { path: '', component: RecordSearchComponent },
      { path: 'detail/:pid', component: RecordDetailComponent }
    ],
    data: {
      showSearchInput: true,
      adminMode: false,
      linkPrefix: 'records',
      types: [
        {
          key: 'institutions',
          label: 'Institutions'
        }
      ]
    }
  },
  {
    path: 'usi/record/search',
    children: [
      { path: ':type', component: RecordSearchComponent },
      { path: ':type/detail/:pid', component: RecordDetailComponent }
    ],
    data: {
      showSearchInput: true,
      adminMode: false,
      linkPrefix: '/usi/record/search',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          preFilters: {
            institution: 'usi'
          }
        },
        {
          key: 'patrons',
          label: 'Utilisateurs'
        }
      ]
    }
  },
  {
    path: 'hevs/record/search',
    children: [
      { path: ':type', component: RecordSearchComponent },
      { path: ':type/detail/:pid', component: RecordDetailComponent }
    ],
    data: {
      showSearchInput: true,
      adminMode: false,
      linkPrefix: '/hevs/record/search',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          preFilters: {
            institution: 'hevs'
          }
        }
      ]
    }
  },
  {
    path: 'record/search',
    children: [
      { path: ':type', component: RecordSearchComponent },
      { path: ':type/detail/:pid', component: RecordDetailComponent }
    ],
    data: {
      showSearchInput: true,
      adminMode: false,
      linkPrefix: '/record/search',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent
        }
      ]
    }
  },
  {
    path: 'admin/record/search',
    children: [
      { path: ':type', component: RecordSearchComponent },
      { path: ':type/detail/:pid', component: RecordDetailComponent },
      { path: ':type/edit/:pid', component: EditorComponent },
      { path: ':type/new', component: EditorComponent }
    ],
    data: {
      linkPrefix: '/admin/record/search',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          detailComponent: DetailComponent,
          canAdd,
          canUpdate,
          canDelete,
          aggregations
        },
        {
          key: 'institutions',
          label: 'Organisations',
          component: InstitutionComponent
        },
        {
          key: 'patrons',
          label: 'Utilisateurs'
        }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
