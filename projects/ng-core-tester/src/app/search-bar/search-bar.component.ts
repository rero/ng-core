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
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html'
})
export class SearchBarComponent implements OnInit {

  @Input() viewcode: string;
  @Input() size: string = undefined;
  @Input() maxLengthSuggestion = 100;


  get action() {
    return `/records/documents`;
  }

  recordTypes = [];

  static getPersonName(metadata) {
    for (const source of ['rero', 'bnf', 'gnd']) {
      if (metadata[source] && metadata[source].preferred_name_for_person) {
        return metadata[source].preferred_name_for_person;
      }
    }
  }

  constructor(private translateService: TranslateService) {
   }

  ngOnInit() {
    this.recordTypes = [{
      type: 'documents',
      field: 'title',
      getSuggestions: (query, persons) => this.getDocumentsSuggestions(query, persons),
      preFilters: this.viewcode ? {view: this.viewcode} : {}
    }, {
      type: 'institutions',
      field: 'name',
      getSuggestions: (query, persons) => this.getInstitutionsSuggestions(query, persons),
      component: this,
      preFilters: this.viewcode ? {view: this.viewcode} : {}
    }];
  }

  getInstitutionsSuggestions(query, institutions) {
    const values = [];
    institutions.hits.hits.map(hit => {
      let text = hit.metadata.name;
      text = text.replace(new RegExp(query, 'gi'), `<b>${query}</b>`);
      values.push({
        text,
        query: '',
        index: 'institutions',
        category: this.translateService.instant('direct links'),
        href: `/records/institutions/detail/${hit.metadata.pid}`,
        iconCssClass: 'fa fa-bank'
      });
    });
    return values;
  }

  getDocumentsSuggestions(query, documents) {
    const values = [];
    documents.hits.hits.map(hit => {
      let text = hit.metadata.title;
      let truncate = false;
      if (text.length > this.maxLengthSuggestion) {
        truncate = true;
        text = hit.metadata.title.substr(0, this.maxLengthSuggestion);
      }
      text = text.replace(new RegExp(query, 'gi'), `<b>${query}</b>`);
      if (truncate) {
        text = text + ' ...';
      }
      values.push({
        text,
        query: hit.metadata.title.replace(/[:\-\[\]()/"]/g, ' ').replace(/\s\s+/g, ' '),
        index: 'documents',
        category: this.translateService.instant('documents')
        // href: `/${this.viewcode}/documents/${hit.metadata.pid}`
      });
    });
    return values;
  }
}
