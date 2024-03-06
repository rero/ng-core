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
import { Component, Input } from '@angular/core';
import { ResultItem } from './result-item';

/**
 * Component for displaying record as JSON in brief views.
 */
@Component({
  template: `
    {{ record|json }}
    @if (detailUrl) {
      <div class="mt-3">
        @if (detailUrl.external === false) {
          <a class="btn btn-primary btn-sm" [routerLink]="detailUrl.link">
            <i class="fa fa-file-o mr-2"></i>{{ 'Show' | translate }}
          </a>
        } @else {
          <a class="btn btn-primary btn-sm" [href]="detailUrl.link">
            <i class="fa fa-file-o mr-2"></i>{{ 'Show' | translate }}
          </a>
        }
      </div>
    }
  `
})
export class JsonComponent implements ResultItem {
  // Record data.
  @Input()
  record: any;

  // Type of resource.
  @Input()
  type: string;

  // Info for detail URL link.
  @Input()
  detailUrl: { link: string, external: boolean };
}
