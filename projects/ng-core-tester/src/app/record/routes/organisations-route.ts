
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
import { ActivatedRoute } from '@angular/router';
import {
  DetailComponent as RecordDetailComponent,
  EditorComponent,
  IRoute,
  RecordSearchPageComponent
} from '@rero/ng-core';
import { of } from 'rxjs';
import { RouteToolsService } from '../../service/route-tools-service';

export class OrganisationsRoute implements IRoute {

  // Route name
  readonly name = 'organisations';

  // Priority of the current route
  readonly priority = 0;

  /**
   * Constructor
   * @param _routeToolsService - RouteToolsService
   */
  constructor(
    private _routeToolsService: RouteToolsService,
    private _activatedRoute: ActivatedRoute
  ) {}

  /**
   * Get Configuration.
   * @return Object or array of configuration.
   */
  getConfiguration(): object {
    return {
      matcher: (url: any) => this._routeToolsService.organisationsMatcher(url),
      children: [
        { path: ':type', component: RecordSearchPageComponent },
        { path: ':type/new', component: EditorComponent },
        { path: ':type/edit/:pid', component: EditorComponent },
        { path: ':type/detail/:pid', component: RecordDetailComponent }
      ],
      data: {
        showSearchInput: true,
        adminMode: () => this._adminMode(),
        types: [
          {
            key: 'organisations',
            label: 'Organisations'
          }
        ]
      }
    };
  }

  /**
   * Example for Activated injection (not a real example)
   * Admin mode
   */
  private _adminMode() {
    const can = 'admin' in this._activatedRoute.snapshot.queryParams
    && Number(this._activatedRoute.snapshot.queryParams.admin) === 1;
    return of({
      can,
      message: ''
    });
  }
}
