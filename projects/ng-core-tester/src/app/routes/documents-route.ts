
/*
 * Invenio angular core
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
import {
  ActionStatus,
  RouteInterface,
  DetailComponent as RecordDetailComponent,
  RecordSearchComponent,
  EditorComponent
} from '@rero/ng-core';
import { DocumentComponent } from '../record/document/document.component';
import { DetailComponent } from '../record/document/detail/detail.component';
import { Observable, of } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { JSONSchema7 } from 'json-schema';

export class DocumentsRoute implements RouteInterface {

  /** Route name */
  readonly name = 'documents';

  /**
   * Get Configuration
   * @return Object
   */
  getConfiguration() {
    return {
      path: 'record/search',
      children: [
        { path: ':type', component: RecordSearchComponent },
        { path: ':type/new', component: EditorComponent },
        { path: ':type/edit/:pid', component: EditorComponent },
        { path: ':type/detail/:pid', component: RecordDetailComponent }
      ],
      data: {
        showSearchInput: true,
        // adminMode: false,
        types: [
          {
            key: 'documents',
            label: 'Documents',
            component: DocumentComponent,
            detailComponent: DetailComponent,
            aggregationsOrder: [
              'document_type',
              'author',
              'library',
              'organisation',
              'language',
              'subject',
              'status'
            ],
            aggregationsExpand: ['document_type'],
            aggregationsBucketSize: 5,
            preprocessRecordEditor: (record: any): any => {
              // Update data record before transmit data to the form
              return record;
            },
            postprocessRecordEditor: (record: any): any => {
              // Update data record before transmit to the API
              return record;
            },
            preCreateRecord: (record: any): any => {
              // Update data record before create record
              return record;
            },
            preUpdateRecord: (record: any): any => {
              // Update data record before update record
              return record;
            },
            pagination: {
              boundaryLinks: true,
              maxSize: 5
            },
            formFieldMap: (field: FormlyFieldConfig, jsonSchema: JSONSchema7): FormlyFieldConfig => {
              // Populates each select with custom options
              if (field.type === 'enum') {
                field.templateOptions.options = [ { label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' } ];
              }
              return field;
            },
            canAdd: (record: any): Observable<ActionStatus> => {
              return of({
                can: Math.random() >= 0.5,
                message: ''
              });
            },
            canUpdate: (record: any): Observable<ActionStatus> => {
              return of({
                can: Math.random() >= 0.5,
                message: ''
              });
            },
            canDelete: (record: any): Observable<ActionStatus> => {
              return of({
                can: Math.random() >= 0.5,
                message: ''
              });
            }
          }
        ]
      }
    };
  }
}
