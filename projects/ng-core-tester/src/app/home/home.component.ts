/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { Component, inject, OnInit } from '@angular/core';
import { RecordSearchService } from '@rero/ng-core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DocumentComponent } from '../record/document/document.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    standalone: false
})
export class HomeComponent implements OnInit {

  private recordSearchService: RecordSearchService = inject(RecordSearchService);
  private spinner: NgxSpinnerService = inject(NgxSpinnerService);

  // Configuration for resources.
  recordConfig: any[] = [
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

  // Katex
  katexTitle = 'Infinitesimal Hilbertianity of Locally $$\\mathrm{CAT}(\\kappa )$$-Spaces';

  katex = 'We show that, given a metric space $$(\\mathrm{Y},\\textsf {d} )$$of curvature bounded from above in the sense of Alexandrov, and a positive Radon measure $$\\mu $$on $$\\mathrm{Y}$$giving finite mass to bounded sets, the resulting metric measure space $$(\\mathrm{Y},\\textsf {d} ,\\mu )$$is infinitesimally Hilbertian, i.e. the Sobolev space $$W^{1,2}(\\mathrm{Y},\\textsf {d} ,\\mu )$$is a Hilbert space. The result is obtained by constructing an isometric embedding of the ‘abstract and analytical’ space of derivations into the ‘concrete and geometrical’ bundle whose fibre at $$x\\in \\mathrm{Y}$$is the tangent cone at x of $$\\mathrm{Y}$$. The conclusion then follows from the fact that for every $$x\\in \\mathrm{Y}$$such a cone is a $$\\mathrm{CAT}(0)$$space and, as such, has a Hilbert-like structure.';

  ngOnInit(): void {
      // Initializes aggregations filters to launch the first search.
    this.recordSearchService.setAggregationsFilters([]);
  }
  /**
   * Show spinner for 5 seconds
   */
  showSpinner() {
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 3000);
  }
}
