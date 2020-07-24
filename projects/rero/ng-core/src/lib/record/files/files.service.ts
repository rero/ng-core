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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../api/api.service';
import { File } from '../record';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  /**
   * Constructor.
   *
   * @param _http HttpClient.
   * @param _apiService ApiService.
   */
  constructor(private _http: HttpClient, private _apiService: ApiService) {}

  /**
   * List files for the given record.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @returns Observable resolving the list of files.
   */
  list(type: string, pid: string): Observable<Array<File>> {
    return this._http
      .get(
        `${this._apiService.getEndpointByType(
          type,
          true
        )}/${pid}/files?versions`
      )
      .pipe(
        map((result: any) => {
          if (result.contents) {
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
  put(
    type: string,
    pid: string,
    fileKey: string,
    fileData: any
  ): Observable<File> {
    return this._http.put<File>(
      `${this._apiService.getEndpointByType(
        type,
        true
      )}/${pid}/files/${fileKey}`,
      fileData
    );
  }

  /**
   * Remove file specified by given ID.
   *
   * @param type Type of resource.
   * @param pid PID of the record.
   * @param fileKey File key.
   * @param versionId ID of the version to remove.
   * @return Observable emitting nothing when file is successfully removed.
   */
  delete(
    type: string,
    pid: string,
    fileKey: string,
    versionId: string
  ): Observable<void> {
    return this._http.delete<void>(
      `${this._apiService.getEndpointByType(
        type,
        true
      )}/${pid}/files/${fileKey}?versionId=${versionId}`
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
  getUrl(type: string, pid: string, fileKey: string): string {
    return `${this._apiService.getEndpointByType(
      type,
      true
    )}/${pid}/files/${fileKey}`;
  }
}
