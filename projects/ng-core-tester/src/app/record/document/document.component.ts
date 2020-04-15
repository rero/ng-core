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

/**
 * Component for displaying a document brief view.
 */
@Component({
  templateUrl: './document.component.html'
})
export class DocumentComponent implements OnInit, ResultItem {
  // Record data.
  @Input()
  record: any;

  // Type of resource.
  @Input()
  type: string;

  // Object containing link to detail.
  @Input()
  detailUrl: { link: string, external: boolean };

  /**
   * Constructor
   *
   * @param _titleMetaService TitleMetaService
   */
  constructor(private _titleMetaService: TitleMetaService) { }

  /**
   * Component initialization.
   *
   * Set meta title.
   */
  ngOnInit() {
    this._titleMetaService.setTitle(this.type);
  }
}
