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
import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ActionStatus } from '@rero/ng-core';
import { JSONSchema7 } from 'json-schema';
import { Observable, of } from 'rxjs';
import { HomeComponent } from './home/home.component';
import { DetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { RouteService } from './routes/route.service';


const adminModeCanNot = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

const adminModeCan = (): Observable<ActionStatus> => {
  return of({
    can: true,
    message: ''
  });
};

const canAdd = (record: any): Observable<ActionStatus> => {
  return of({
    can: Math.random() >= 0.5,
    message: ''
  });
};

const canUpdate = (record: any): Observable<ActionStatus> => {
  return of({
    can: Math.random() >= 0.5,
    message: ''
  });
};

const canDelete = (record: any): Observable<ActionStatus> => {
  return of({
    can: Math.random() >= 0.5,
    message: `You <strong>cannot</strong> delete this record #${record.id} !`
  });
};

const canRead = (record: any): Observable<ActionStatus> => {
  return of({
    can: Math.random() >= 0.5,
    message: ''
  });
};

const formFieldMap = (field: FormlyFieldConfig, jsonSchema: JSONSchema7): FormlyFieldConfig => {
  // Populates "type" field with custom options
  const formOptions = jsonSchema.form;
  if (formOptions && formOptions.field === 'type') {
    field.type = 'select';
    field.templateOptions.options = [
      { label: 'Type 1', value: 'type 1' },
      { label: 'Type 2', value: 'type 2' }
    ];
    field.defaultValue = 'type 2';
  }

  return field;
};

const aggregations = (agg: object) => {
  return of(agg);
};

export function matchedUrl(url: UrlSegment[]) {
  const segments = [new UrlSegment(url[0].path, {})];

  return {
    consumed: segments,
    posParams: { type: new UrlSegment(url[1].path, {}) }
  };
}

export function documentsMatcher(url: Array<UrlSegment>) {
  if (url[0].path === 'records' && url[1].path === 'documents') {
    return matchedUrl(url);
  }
  return null;
}

export function institutionsMatcher(url: Array<UrlSegment>) {
  if (url[0].path === 'records' && url[1].path === 'institutions') {
    return matchedUrl(url);
  }
  return null;
}

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    matcher: documentsMatcher,
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: true,
      adminMode: adminModeCanNot,
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
    matcher: institutionsMatcher,
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: true,
      adminMode: adminModeCanNot,
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
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: true,
      adminMode: adminModeCanNot,
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
    path: 'admin/record/search',
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          detailComponent: DetailComponent,
          canAdd,
          canUpdate,
          canDelete,
          canRead,
          aggregations,
          adminMode: adminModeCan,
          formFieldMap,
          listHeaders: {
            'Content-Type': 'application/rero+json'
          },
          itemHeaders: {
            'Content-Type': 'application/rero+json'
          }
        },
        {
          key: 'institutions',
          label: 'Organisations'
        }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private routeService: RouteService) {
    this.routeService.initializeRoutes();
  }
}
