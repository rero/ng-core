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
import { Component, computed, effect, inject, model } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { RecordSearchStore } from '../../store/record-search.store';

// Documentation: https://primeng.org/tabview

@Component({
    selector: 'ng-core-search-tabs',
    templateUrl: './search-tabs.component.html',
    imports: [Tabs, TabList, Ripple, Tab, TranslatePipe]
})
export class SearchTabsComponent {

  private store = inject(RecordSearchStore);
  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  /** Tabs displayed (configs not flagged as hidden) */
  readonly typesInTabs = computed(() =>
    this.store.configs().filter(item => item.hideInTabs !== true)
  );

  /** Currently selected tab value, two-way bound to PrimeNG Tabs. */
  currentType = model<string | undefined>(undefined);

  constructor() {
    this.currentType.set(this.activatedRoute.snapshot.params.type);
    effect(() => {
      const typeName = this.currentType();
      if (typeName) {
        this.store.updateCurrentType(typeName);
      }
    });
  }
}
