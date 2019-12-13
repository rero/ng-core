/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { TitleMetaService } from '@rero/ng-core';
import { DetailRecord } from '@rero/ng-core/lib/record/detail/view/detail-record';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html'
})
export class DetailComponent implements DetailRecord, OnInit {
  /** Observable resolving record data */
  record$: Observable<any>;

  /** Resource type */
  type: string;

  /** Record data */
  record: any;

  constructor(private titleMetaService: TitleMetaService) { }

  ngOnInit(): void {
    this.titleMetaService.setTitle('Detail of ' + this.type);
    this.record$.subscribe((record) => {
      this.record = record;
    });
  }
}
