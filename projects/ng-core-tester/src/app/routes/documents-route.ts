
/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { TranslateService } from '@ngx-translate/core';
import {
  ActionStatus,
  DetailComponent as RecordDetailComponent,
  EditorComponent, JSONSchema7, RecordSearchPageComponent,
  RouteInterface
} from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { DetailComponent } from '../record/document/detail/detail.component';
import { DocumentComponent } from '../record/document/document.component';
import { inject } from '@angular/core';

/**
 * Routes for document resources
 */
export class DocumentsRoute implements RouteInterface {

  protected translateService: TranslateService = inject(TranslateService);

  // Route name
  readonly name = 'documents';

  /**
   * Get Configuration.
   *
   * @return Configuration object.
   */
  getConfiguration() {
    return {
      path: 'record/search',
      children: [
        { path: ':type', component: RecordSearchPageComponent },
        { path: ':type/new', component: EditorComponent },
        { path: ':type/edit/:pid', component: EditorComponent },
        { path: ':type/detail/:pid', component: RecordDetailComponent }
      ],
      data: {
        showSearchInput: true,
        types: [
          {
            key: 'documents',
            label: 'Documents',
            component: DocumentComponent,
            detailComponent: DetailComponent,
            editorSettings: {
              longMode: true
            },
            defaultSearchInputFilters: [{
              'key': 'organisation',
              'values': ["1"]
            }],
            aggregationsOrder: [
              'document_type',
              'author',
              'year',
              'acquisition',
              'library',
              'organisation',
              'language',
              'subject',
              'status'
            ],
            listHeaders: {
              Accept: 'application/rero+json, application/json'
            },
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
              boundaryLinks: false,
              maxSize: 5,
              pageReport: false,
              rowsPerPageOptions: [10,20]
            },
            formFieldMap: (field: FormlyFieldConfig, jsonSchema: JSONSchema7): FormlyFieldConfig => {
              // Populates each select with custom options
              if (field.type === 'enum') {
                field.props.options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }];
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
            },
            deleteMessage: (): string[] => {
              // If you want to translate the strings, you have to do it here
              return [
                this.translateService.instant('Document: Do you really want to delete this record?'),
                this.translateService.instant('Attached items will also be deleted.')
              ];
            }
          }
        ]
      }
    };
  }
}
