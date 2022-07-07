/*
 * RERO angular core
 * Copyright (C) 2022 RERO
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
import { Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { RecordService } from '../record.service';

@Component({
  selector: 'ng-core-record-statistics',
  templateUrl: './record-statistics.component.html',
  styleUrls: ['./record-statistics.component.scss']
})
export class RecordStatisticsComponent implements OnInit {
  // Record PID.
  @Input()
  pid: string;

  // Type of resource.
  @Input()
  type: string;

  // Record statistics
  statistics$: Observable<any>;

  /**
   * Constructor.
   *
   * @param _recordService Record service.
   */
   constructor(
    private _recordService: RecordService,
  ) {}

  ngOnInit(): void {
    this.statistics$ = this._recordService.getRecord(this.type, this.pid)
      .pipe(map((record: any) => record.metadata.statistics));
  }
}
