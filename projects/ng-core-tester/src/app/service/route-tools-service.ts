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

import { Injectable } from '@angular/core';
import { UrlSegment } from '@angular/router';
import { ActionStatus } from '@rero/ng-core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteToolsService {

  /**
   * Returned matched URL.
   *
   * @param url List of URL segments.
   * @return Object representing the matched URL.
   */
  matchedUrl(url: UrlSegment[]): object {
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
  documentsMatcher(url: Array<UrlSegment>): object | null {
    if (url[0].path === 'records' && url[1].path === 'documents') {
      return this.matchedUrl(url);
    }
    return null;
  }

  /**
   * URL matchs organisation resource.
   *
   * @param url List of URL segments.
   * @return Object representing the matched URL.
   */
  organisationsMatcher(url: Array<UrlSegment>): object | null {
    if (url[0].path === 'records' && url[1].path === 'organisations') {
      return this.matchedUrl(url);
    }
    return null;
  }

  /**  Can. */
  can(message: string = ''): Observable<ActionStatus> {
    return of({ can: true, message });
  }

  /**  Can not. */
  canNot(message: string = ''): Observable<ActionStatus> {
    return of({ can: false, message });
  }

  /**
   * Wether files metadata can be updated.
   *
   * @param record Record.
   */
  canUpdateFilesMetadata(record: any): Observable<ActionStatus> {
    return this.can();
  }

  /** Permissions */
  permissions(record: any): Observable<IActionPermissions> {
    const perms = record.metadata.permissions;
    perms.read = true;
    perms.update = true;
    perms.delete = false;

    return of({
      canRead: {
        can: perms.read,
        message: '',
      },
      canUpdate: {
        can: perms.update,
        message: '',
      },
      canDelete: {
        can: perms.delete,
        message: 'This record cannot be deleted.',
      },
    });
  }

  /** Custom treatment for aggregations. */
  aggregations(agg: object): Observable<any> {
    return of(agg);
  }

  /** Filter files list (callback function called in Array.prototype.filter) */
  filterFilesList(file: any): boolean {
    return file.key.indexOf('.pdf') !== -1;
  }

  /** Order file list. */
  orderFilesList(a: any, b: any): number {
    if (a.metadata.order < b.metadata.order) {
      return -1;
    }
    if (a.metadata.order > b.metadata.order) {
      return 1;
    }
    return 0;
  }
}

/** Permissions interface */
export interface IActionPermissions {
  canRead: {
    can: boolean,
    message: string
  };
  canUpdate: {
    can: boolean,
    message: string
  };
  canDelete: {
    can: boolean,
    message: string
  };
}
