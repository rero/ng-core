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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { File, Record } from '../record';
import { UntypedFormGroup } from '@angular/forms';
import { orderedJsonSchema, removeEmptyValues } from '../editor/utils';
import { RecordService } from '../record.service';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';

@Injectable({
  providedIn: 'root',
})
export class FilesService {

  // Current file parent record.
  currentParentRecord = new BehaviorSubject(null);

  // Current file parent record observable.
  currentParentRecord$ = this.currentParentRecord.asObservable();

  /**
   * Constructor.
   *
   * @param _http HttpClient.
   * @param apiService ApiService.
   * @param recordService: RecordService
   * @param formlyJsonschema: FormlyJsonschema
   */
  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private recordService: RecordService,
    private formlyJsonschema: FormlyJsonschema
  ) {}

  /**
   * Get the file parent record.
   *
   * It can be a resource such as document or a dedicated resource
   * (rero-invenio-files).
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @returns an observable of the parent record.
   */
  getParentRecord(type: string, pid: string): Observable<Record> {
      return this.recordService.getRecord(type, pid);
  }

  /**
   * Create the file parent record.
   *
   * It can be a resource such as document or a dedicated resource
   * (rero-invenio-files). Here we assume the first case thus it should
   * exists.
   *
   * @param type
   * @param pid
   */
  createParentRecord(type: string, pid: string): Observable<Record> {
    throw new Error('Not implemented');
  }

  /**
   * Updates the parent record metadata.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param metadata new metadata
   * @returns the modified record
   */
  updateParentRecordMetadata(type: string, pid: string, metadata:any): Observable<Record> {
    return of(null);
  }

  /**
   * List files for the given record.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @returns Observable resolving the list of files.
   */
  list(type: string, pid: string, parentRecord: Record): Observable<Array<File>> {
    return this.http.get(`${this.apiService.getEndpointByType(type, true)}/${pid}/files?versions`)
    .pipe(
      map((result: any) => {
        if (result.contents) {
          result.contents.map(val => val.metadata = this._getFilesMetadata(parentRecord, val.key));
          return result.contents;
        }
        return [];
      })
    );
  }

  /**
   * Create a new file or update one, depending if fileKey is existing or not.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param fileKey File key.
   * @param fileData File data.
   * @return Observable emitting the new created file object.
   */
  private put(type: string, pid: string, fileKey: string, fileData: any): Observable<File> {
    return this.http.put<File>(`${this.apiService.getEndpointByType(type, true)}/${pid}/files/${fileKey}`, fileData);
  }

  /**
   * Upload a new file and create the corresponding data.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param parentRecord resource to host the file
   * @param fileKey File key.
   * @param fileData File data.
   * @returns the created file
   */
  create(type: string, pid: string, parentRecord: Record, fileKey: string, fileData: any): Observable<File> {
    return this.put(type, pid, fileKey, fileData);
  }

  /**
   * Replace an existing file.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param parentRecord resource to host the file
   * @param fileKey File key.
   * @param fileData File data.
   * @returns the updated file
   */
  update(type: string, pid: string, parentRecord: Record,  file: File, fileData: any): Observable<File> {
    return this.put(type, pid, file.key, fileData);
  }

  /**
   * Create the form to change the file metadata.
   *
   * @param type Type of resource.
   * @returns an object with the form, the model and the formly params.
   */
  getMetadataForm(type: string) {
    // Load JSON schema and initialize form.
    return this.recordService.getSchemaForm(type).pipe(
      map((jsonSchema: any) => {
        if (jsonSchema.schema.properties._files) {
          const metadataForm: {
            fields: Array<any>;
            model: any;
            form: any;
          } = {
            fields: [
              this.formlyJsonschema.toFieldConfig(orderedJsonSchema(jsonSchema.schema.properties._files.items), {
                map: (field: any, schema: any) => {
                  if (schema.form && schema.form.expressions) {
                    field.expressions = schema.form.expressions;
                  }
                  return field;
                },
              }),
            ],
            model: null,
            form: new UntypedFormGroup({}),
          };
          return metadataForm;
        }
      })
    );
  }

  /**
   * Remove a given file.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param parentRecord resource to host the file
   * @param file File to delete.
   * @return Observable of the http response.
   */
  delete(type: string, pid: string, parentRecord: Record, file: File): Observable<any> {
    return this.http.delete(
      `${this.apiService.getEndpointByType(type, true)}/${pid}/files/${file.key}?versionId=${file.version_id}`
    );
  }

  /**
   * Return the URL of the file.
   *
   * @param type Type of resource.
   * @param pid Record PID.
   * @param fileKey File key.
   * @returns URL of the file.
   */
  getUrl(type: string, pid: string, file: File): string {
    return `${this.apiService.getEndpointByType(type, true)}/${pid}/files/${file.key}`;
  }

  /**
   * Update the file metadata.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param parentRecord resource to host the file
   * @param file File to delete.
   * @return Observable of the updated data.
   */
  updateMetadata(type: string, pid: string, parentRecord: Record, file: File): Observable<any> {
    return this.recordService.getRecord(type, pid).pipe(
      switchMap((record) => {
        record._files.map(val => {
          if (val.key = file.key) {
            val.metadata = removeEmptyValues(file.metadata);
          }
        })
        return this.recordService.update(type, pid, record);
      })
    );
  }

   /**
   * Get files metadata corresponding to file key, stored in record.
   *
   * @param record resource hosting the file.
   * @param fileKey File key.
   * @returns Metadata object for the file.
   */
   private _getFilesMetadata(record: any, fileKey: string): any {
    if (!record._files) {
      return null;
    }

    // Get metadata stored in record.
    const metadata = record._files.filter((item: any) => fileKey === item.key);

    return metadata.length > 0 ? metadata[0] : null;
  }
}
