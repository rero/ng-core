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
import { CoreConfigService } from '../core-config.service';

/**
 * Service giving information about API.
 */
@Injectable(
  {
    providedIn: 'root'
  }
)
export class ApiService {
  /**
   * API base URL.
   *
   * Ex: https://localhost:5000
   */
  public baseUrl = '';

  /**
   * API prefix
   *
   * Ex: /api
   */
  public endpointPrefix = '/';

  /**
   * Constructor
   * @param config - Config, global configuration
   */
  constructor(private configService: CoreConfigService) {
    this.baseUrl = this.configService.apiBaseUrl;
    this.endpointPrefix = this.configService.apiEndpointPrefix;
  }

  /**
   * Return invenio API Endpoint corresponding to type.
   * @param type - string, type of the resource
   * @param absolute - boolean, if absolute or relative url must be returned.
   */
  public getEndpointByType(type: string, absolute: boolean = false) {
    let endpoint = this.endpointPrefix + '/' + type;

    if (absolute === true) {
      endpoint = this.baseUrl + endpoint;
    }

    return endpoint;
  }

  /**
   * Returne $ref endpoint to resource
   * @param type - string, type of resource
   * @param id - string id of the record
   */
  getRefEndpoint(type: string, id: string) {
    return `${this.configService.$refPrefix}${this.endpointPrefix}/${type}/${id}`;
  }

  /**
   * Return invenio API FormOption Endpoint corresponding to type.
   * @param type - string, type of the resource
   * @param absolute - boolean, if absolute or relative url must be returned.
   */
  public getSchemaFormEndpoint(type: string, absolute: boolean = false) {
    let endpoint = this.configService.schemaFormEndpoint + '/' + type;

    if (absolute === true) {
      endpoint = this.baseUrl + endpoint;
    }

    return endpoint;

  }
}
