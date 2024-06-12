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
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RouteCollectionService } from '@rero/ng-core';
import { DocumentsRoute } from './documents-route';

/**
 * Service for managing routes.
 */
@Injectable({
  providedIn: 'root'
})
export class RouteService {
  // Inject
  private routeCollectionService = inject(RouteCollectionService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  initializeRoutes() {
    this.routeCollectionService
      .addRoute(new DocumentsRoute(this.translateService));

    this.routeCollectionService.getRoutes().map((route: any) => {
      this.router.config.push(route);
    });
  }
}
