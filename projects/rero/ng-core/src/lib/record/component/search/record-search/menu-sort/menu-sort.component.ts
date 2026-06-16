// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { SortOption } from '../../../../model/record-search.interface';
import { RecordSearchStore } from '../../store/record-search.store';

@Component({
  selector: 'ng-core-menu-sort',
  templateUrl: './menu-sort.component.html',
  imports: [Menu, Button, NgClass, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSortComponent {
  protected translateService: TranslateService = inject(TranslateService);
  protected store = inject(RecordSearchStore);

  language = toSignal(this.translateService.onLangChange);

  selectedOption = computed(() =>
    this.store.config().sortOptions.find((opt: SortOption) => opt.value === this.store.activeSort()),
  );

  options = computed(() => {
    this.language(); // track language changes to re-evaluate translations
    return this.sortOptions();
  });

  /** Return the sort options from config, translated and sorted alphabetically. */
  sortOptions(): MenuItem[] {
    const translations: MenuItem[] = [];
    this.store.config().sortOptions.map((option: SortOption) => {
      if (option.label) {
        const newOption: MenuItem = { label: option.label, value: option.value, icon: option.icon };
        newOption.label = this.translateService.instant(option.label);
        newOption.command = (event: MenuItemCommandEvent) => {
          if (event.item?.value) {
            this.store.updateSort(event.item.value);
            this.store.updatePage(1);
          }
        };
        translations.push(newOption);
      }
    });
    return translations.sort((a: MenuItem, b: MenuItem) => a.label!.localeCompare(b.label!));
  }
}
