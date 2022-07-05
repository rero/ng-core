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
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // API base URL. Ex: https://localhost:5000.
  baseUrl = '';

  // API prefix. Ex: /api
  endpointPrefix = '/';

  /**
   * Constructor.
   *
   * Initializes base URL and endpoint API prefix.
   *
   * @param _configService Configuration service.
   */
  constructor(private _configService: CoreConfigService) {
    this.baseUrl = this._configService.apiBaseUrl;
    this.endpointPrefix = this._configService.apiEndpointPrefix;
  }

  /**
   * Returns Invenio API Endpoint corresponding to type.
   *
   * @param type Type of the resource.
   * @param absolute If absolute or relative url must be returned.
   * @return Endpoint as string.
   */
  getEndpointByType(type: string, absolute: boolean = false): string {
    let endpoint = this.endpointPrefix + '/' + type;
    if (absolute === true) {
      endpoint = this.baseUrl + endpoint;
    }
    return endpoint;
  }

  /**
   * Returns Invenio-RERO-base API export endpoint corresponding to type.
   *
   * @param type Type of the resource.
   * @param absolute If absolute or relative url must be returned.
   * @return Endpoint as string.
   */
  getExportEndpointByType(type: string, absolute: boolean = false): string {
    let endpoint = this.endpointPrefix + '/export/' + type;
    if (absolute === true) {
      endpoint = this.baseUrl + endpoint;
    }
    return endpoint;
  }

  /**
   * Returns $ref endpoint to resource.
   *
   * @param type Type of resource.
   * @param id Id of the record.
   * @return Ref endpoint as string.
   */
  getRefEndpoint(type: string, id: string): string {
    return `${this._configService.$refPrefix}${this.endpointPrefix}/${type}/${id}`;
  }

  /**
   * Returns invenio API FormOption Endpoint corresponding to type.
   *
   * @param type Type of the resource
   * @param absolute If absolute or relative url must be returned.
   * @return Schema form endpoint.
   */
  getSchemaFormEndpoint(type: string, absolute: boolean = false): string {
    let endpoint = this._configService.schemaFormEndpoint + '/' + type;
    if (absolute === true) {
      endpoint = this.baseUrl + endpoint;
    }
    return endpoint;
  }
}
