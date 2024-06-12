/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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
import { Component, inject, input, output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DropdownChangeEvent } from 'primeng/dropdown';

export interface ISortOption {
  value: string;
  label: string;
  defaultQuery?: boolean;
  defaultNoQuery?: boolean;
}

interface IConfig {
  sortOptions: ISortOption[],
  [key:string]: any
};

@Component({
  selector: 'ng-core-menu-sort',
  templateUrl: './menu-sort.component.html'
})
export class MenuSortComponent {

  /** Injection */
  translateService = inject(TranslateService);
  activatedRoute = inject(ActivatedRoute);

  /** Input */
  config = input.required<IConfig>();
  sortParamName = input<string>('sort');

  /** Change event */
  onChange = output<string>();

  /** Return the sort options from config. */
  get sortOptions(): ISortOption[] {
    return (this.config().sortOptions)
      ? this.config().sortOptions
          .map((option: ISortOption) => {
            option.label = this.translateService.instant(option.label);
            return option;
          })
          .sort((a: ISortOption, b: ISortOption) => a.label.localeCompare(b.label))
      : [];
  }

  /**
   * Return the current sort object.
   * @returns SortOption
   */
  get currentSortOption(): ISortOption {
    const sortParam = this.activatedRoute.snapshot?.queryParamMap?.get(this.sortParamName());
    return (sortParam && this.config().sortOptions)
      ? this.config().sortOptions.find((item: ISortOption) => item.value === sortParam)
      : null;
  }

  /**
   * Change sorting with select a new value in dropdown menu
   * @param dropdownEvent - DropdownChangeEvent
   */
  changeSorting(dropdownEvent: DropdownChangeEvent): void {
    this.onChange.emit(dropdownEvent.value);
  }
}
