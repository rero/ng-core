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
import { Component, OnInit } from '@angular/core';
import { DetailRecord } from '@rero/ng-core';
import { Observable } from 'rxjs';

/**
 * Component for displaying the detail of a document.
 */
@Component({
    selector: 'app-detail',
    templateUrl: './detail.component.html',
    standalone: false
})
export class DetailComponent implements DetailRecord, OnInit {
  // Observable resolving record data
  record$: Observable<any>;

  // Resource type
  type: string;

  // Record data
  record: any;

  ngOnInit(): void {
    this.record$.subscribe((record) => {
      this.record = record;
    });
  }
}
