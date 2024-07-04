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
import { Component } from '@angular/core';
import { MenuItem, RecordSearchService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DocumentComponent } from '../record/document/document.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {

  // Configuration for resources.
  recordConfig: Array<any> = [
    {
      key: 'documents',
      label: 'Documents',
      component: DocumentComponent
      ,
      exportFormats: [
        {
          label: 'JSON',
          format: 'json'
        }
      ],
    },
    {
      key: 'organisations',
      label: 'Organisations',
      exportFormats: [
        {
          label: 'JSON',
          format: 'json'
        },
        {
          label: 'CSV',
          format: 'csv'
        }
      ],
    }
  ];

  // Markdown text
  markdownText = '*Hello* **world**';

  /**
   * Show spinner for 5 seconds
   */
  showSpinner() {
    this._spinner.show();

    setTimeout(() => {
      this._spinner.hide();
    }, 3000);
  }

  /**
   * Constructor.
   *
   * - Initializes API object paths.
   * - Empties aggregations filters.
   *
   * @param _recordSearchService Record search service.
   * @param _spinner Spinner service
   */
  constructor(
    private _recordSearchService: RecordSearchService,
    private _spinner: NgxSpinnerService
  ) {
    // Initializes aggregations filters to launch the first search.
    this._recordSearchService.setAggregationsFilters([]);
  }
}
