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
import { CoreConfigService } from '@rero/ng-core';
import { environment } from '../environments/environment';

/**
 * Service for configuring the application.
 */
@Injectable({
  providedIn: 'root'
})
export class AppConfigService extends CoreConfigService {
  /**
   * Constructor.
   */
  constructor() {
    super();
    this.production = false;
    this.projectTitle = environment.projectTitle;
    this.apiBaseUrl = environment.apiBaseUrl;
    this.schemaFormEndpoint = '/schemas';
    this.$refPrefix = environment.$refPrefix;
    this.languages = environment.languages;
    this.translationsURLs = environment.translationsURLs;
  }
}
