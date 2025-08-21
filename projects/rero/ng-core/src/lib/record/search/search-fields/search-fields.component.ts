/*
 * RERO angular core
 * Copyright (C) 2024 RERO
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
import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SearchField } from '../../record';
import { MenuItem } from 'primeng/api';

export interface searchFieldEvent {
  action: 'select' | 'reset';
  field?: SearchField;
};

@Component({
    selector: 'ng-core-search-fields',
    templateUrl: './search-fields.component.html',
    standalone: false
})
export class SearchFieldsComponent implements OnInit {

  protected translate: TranslateService = inject(TranslateService);

  // Input
  searchLabel = input<string>('Search in');
  resetLabel = input<string>('Reset');
  searchFields = input.required<SearchField[]>();
  withResetAction = input<boolean>(true);

  // Output
  onChange = output<searchFieldEvent>();

  // Field label
  label = signal(this.processLabel());

  // Field items
  items: MenuItem[] = [];

  /** onInit hook */
  ngOnInit(): void {
    this.searchFields().map((field: any) => {
      this.items.push({
        label: field.label,
        command: () => this.select(field),
      });
    });
    if (this.withResetAction()) {
      this.items.push({ separator: true });
      this.items.push({
        label: this.translate.instant(this.resetLabel()),
        command: () => this.reset(),
      });
    }
    this.label.set(this.processLabel());
  }

  /**
   * Select a field from the menu
   * @param field - SearchField
   */
  select(field: SearchField): void {
    this.label.set(this.processLabel(field.label));
    this.onChange.emit({ action: 'select', field: field });
  }

  /** Reset search field */
  reset(): void {
    this.label.set(this.processLabel());
    this.onChange.emit({ action: 'reset' });
  }

  /**
   * Label formatting
   * @param label - The name of the field
   * @returns string, The formatted label
   */
  private processLabel(label = '…'): string {
    return this.translate.instant(this.searchLabel()) + ' ' + label;
  }
}
