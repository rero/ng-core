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
import { Component, Input, OnInit } from '@angular/core';
import { ResultItem, TitleMetaService } from '@rero/ng-core';

@Component({
  templateUrl: './document.component.html'
})

export class DocumentComponent implements OnInit, ResultItem {

  @Input()
  record: any;

  @Input()
  type: string;

  @Input()
  detailUrl: { link: string, external: boolean };

  /**
   * Constructor
   * @param titleMetaService - TitleMetaService
   */
  constructor(private titleMetaService: TitleMetaService) { }

  /**
   * On Init
   */
  ngOnInit(): void {
    this.titleMetaService.setTitle(this.type);
  }
}
