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
import { Component, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONFIG, IAutoComplete, IRecordType, Record } from '@rero/ng-core';
import { MessageService } from 'primeng/api';

/**
 * Component showing the search bar for searching records.
 */
@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    standalone: false
})
export class SearchBarComponent implements OnInit {
  // Inject
  private translateService = inject(TranslateService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  viewcode = input<string>();

  // List of resource type
  recordTypes: IRecordType[] = [];

  value: string = undefined;

  ngOnInit() {
    this.recordTypes = [
      {
        index: 'documents',
        field: 'autocomplete_title',
        groupLabel: this.translateService.instant('Documents'),
        processSuggestions: (data: any, query: string) => this.processDocuments(data, query),
        preFilters: this.viewcode() ? { view: this.viewcode() } : {}
      },
      {
        index: 'entities',
        field: 'autocomplete_name',
        groupLabel: this.translateService.instant('Entities'),
        processSuggestions: (data: any) => this.processEntities(data),
        preFilters: this.viewcode() ? { view: this.viewcode() } : {}
      }
    ];
  }
  onSearch(query) {
    this.router.navigate(['/record', 'search', 'documents'], {
      queryParams: {
        q: query
      }
    });
  }

  onSelect(event: IAutoComplete) {
    const label = event.originalLabel || event.label;
    const doc = new DOMParser().parseFromString(label, 'text/html');
    this.value = doc.body.textContent || '';
    switch(event.index) {
      case 'documents':
        this.messageService.add({
          severity: 'success',
          summary: 'DOCUMENTS',
          detail: 'navigate to document: ' + event.value,
          life: CONFIG.MESSAGE_LIFE
        });
        this.router.navigate(['/record', 'search', 'documents', 'detail', event.value]);
        break;
      case 'entities':
        this.messageService.add({
          severity: 'success',
          summary: 'ENTITIES',
          detail: 'navigate to entity: ' + event.value,
          life: CONFIG.MESSAGE_LIFE
        });
        break;
    }
  }

  private processDocuments(data: Record, query: string): any {
    const values: IAutoComplete[] = [];
    data.hits.hits.map((hit: any) => {
      const title = hit.metadata.title[0].mainTitle[0].value.replace(/[:\-[\]()/"]/g, ' ').replace(/\s\s+/g, ' ');
      values.push({
        iconClass: 'fa fa-book',
        index: 'documents',
        label: this.processLabel(title, query, 80),
        value: hit.metadata.pid,
        originalLabel: title,
      });
    });

    return values;
  }

  private processEntities(data: Record): any {
    const values: IAutoComplete[] = [];
    data.hits.hits.map((hit: any) => {
      values.push({
        iconClass: 'fa fa-user',
        id: hit.metadata.pid,
        index: 'entities',
        label: hit.metadata.authorized_access_point_en,
        value: hit.metadata.pid,
      });
    });

    return values;
  }

  private processLabel(label: string, query: string, truncateSize?: number): string {
    if (truncateSize && label.length > truncateSize) {
      label = label.substring(0, truncateSize) + '…';
    }

    return label.replace(new RegExp(query, 'gi'), `<b class="ui:text-orange-600">${query}</b>`);
  }
}
