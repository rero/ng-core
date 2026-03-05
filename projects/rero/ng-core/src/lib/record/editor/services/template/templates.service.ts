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
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EsResult, JsonObject } from '../../../../model';
import { RecordService } from '../../../service/record/record.service';

export interface TemplateMetadata extends JsonObject {
  name: string;
  pid?: string;
  visibility?: 'public' | 'private';
  data?: JsonObject
  template_type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {

  protected recordService: RecordService = inject(RecordService);

  /**
   * Get all templates corresponding to a resource type
   * @param templateResourceType - string: the resource name where to find templates
   * @param resourceType - string: the resource type
   * @return an observable of template record
   */
  getTemplates(templateResourceType: string, resourceType?: string): Observable<TemplateMetadata[]> {
    const query = (resourceType !== undefined)
      ? `template_type:${resourceType}`
      : '';
    return this.recordService.getRecords<EsResult<TemplateMetadata>>(templateResourceType, {
      query: query,
      itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE
    }).pipe(
      map(data => {
        if (data.hits) {
          return data.hits;
        } else {
          return {
            total: { value: 0 },
            hits: []
          };
        }
      }),
      map(hits => hits.total.value === 0 ? [] : hits.hits),
      map(hits => hits.map(hit => hit.metadata))
    );
  }
}
