/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
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
import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';

@Component({
    selector: 'ng-core-menu-sort',
    templateUrl: './menu-sort.component.html',
    standalone: false
})
export class MenuSortComponent {

  protected translateService: TranslateService = inject(TranslateService);
  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  /** Input */
  config = input.required<MenuItem[]>();
  selectedValue = input<string>();

  language = toSignal(this.translateService.onLangChange);

  selectedOption = computed(() => this.config().find((conf: MenuItem) => conf.value === this.selectedValue()));
  options = computed(() => { this.language(); return this.sortOptions()});

  /** Change event */
  onChange = output<string>();

  /** Return the sort options from config. */
  sortOptions(): MenuItem[] {
    const translations = [];
    this.config().map((option: MenuItem) => {
      const newOption = { ...option };
      newOption.label = this.translateService.instant(option.label);
      newOption.command = (event: MenuItemCommandEvent) => this.onChange.emit(event.item.value);
      translations.push(newOption);
    });

    return translations.sort((a: MenuItem, b: MenuItem) => a.label.localeCompare(b.label));
  }
}
