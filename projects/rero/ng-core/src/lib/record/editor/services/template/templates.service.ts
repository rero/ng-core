// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EsResult, JsonObject } from '../../../../model';
import { RecordService } from '../../../service/record/record.service';

export interface TemplateMetadata extends JsonObject {
  name: string;
  pid?: string;
  visibility?: 'public' | 'private';
  data?: JsonObject;
  template_type?: string;
}

@Injectable({
  providedIn: 'root',
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
    const query = resourceType !== undefined ? `template_type:${resourceType}` : '';
    return this.recordService
      .getRecords<EsResult<TemplateMetadata>>(templateResourceType, {
        query: query,
        itemsPerPage: RecordService.MAX_REST_RESULTS_SIZE,
      })
      .pipe(
        map((data) => {
          if (data.hits) {
            return data.hits;
          } else {
            return {
              total: { value: 0 },
              hits: [],
            };
          }
        }),
        map((hits) => (hits.total.value === 0 ? [] : hits.hits)),
        map((hits) => hits.map((hit) => hit.metadata)),
      );
  }
}
