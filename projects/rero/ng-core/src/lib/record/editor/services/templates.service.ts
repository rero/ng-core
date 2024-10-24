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
import { Record } from '../../record';
import { RecordService } from '../../record.service';

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
  getTemplates(templateResourceType: string, resourceType?: string): Observable<any> {
    const query = (resourceType !== undefined)
      ? `template_type:${resourceType}`
      : '';
    return this.recordService.getRecords(templateResourceType, query, 1, RecordService.MAX_REST_RESULTS_SIZE).pipe(
        map((data: Record) => data.hits),
        map(hits => hits.total === 0 ? [] : hits.hits),
        map(hits => hits.map( hit => hit.metadata))
    );
  }
}
