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
import { Routes, RouterModule } from '@angular/router';
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
  return true;
};

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
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
          canDelete
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
