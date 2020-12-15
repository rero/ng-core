
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
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  DetailComponent,
  DetailComponent as RecordDetailComponent,
  EditorComponent,
  IRoute,
  JSONSchema7,
  RecordSearchPageComponent
} from '@rero/ng-core';
import { DocumentComponent } from '../document/document.component';
import { RouteToolsService } from '../../service/route-tools-service';

export class BackendAdminRoute implements IRoute {

  // Route name
  readonly name = 'backend-admin';

  // Priority of the current route
  readonly priority = 0;

  /**
   * Constructor
   * @param _routeToolsService - RouteToolsService
   */
  constructor(private _routeToolsService: RouteToolsService) {}

  /**
   * Get Configuration.
   * @return Object of configuration.
   */
  getConfiguration(): object {
    return {
      path: 'admin/record/search',
      children: [
        { path: ':type', component: RecordSearchPageComponent },
        { path: ':type/new', component: EditorComponent },
        { path: ':type/edit/:pid', component: EditorComponent },
        { path: ':type/detail/:pid', component: RecordDetailComponent }
      ],
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
            canAdd: () => this._routeToolsService.can(),
            canUpdate: () => this._routeToolsService.can(),
            canDelete: () => this._routeToolsService.can(),
            canRead: () => this._routeToolsService.can(),
            permissions: (record: any) => this._routeToolsService.permissions(record),
            aggregations: (agg: any) => this._routeToolsService.aggregations(agg),
            adminMode: () => this._routeToolsService.can(),
            aggregationsBucketSize: 8,
            aggregationsExpand: ['language'],
            formFieldMap: (field: FormlyFieldConfig, jsonSchema: JSONSchema7): FormlyFieldConfig => {
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
            },
            listHeaders: {
              'Content-Type': 'application/rero+json'
            },
            itemHeaders: {
              'Content-Type': 'application/rero+json'
            },
            files: {
              enabled: true,
              filterList: (file: any) => this._routeToolsService.filterFilesList(file),
              orderList: (a: any, b: any) => this._routeToolsService.orderFilesList(a, b),
              infoExcludedFields: ['restriction', 'type'],
              canUpdateMetadata: (record: any) => this._routeToolsService.canUpdateFilesMetadata(record)
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
            ]
          },
          {
            key: 'organisations',
            label: 'Organisations'
          }
        ]
      }
    };
  }
}
