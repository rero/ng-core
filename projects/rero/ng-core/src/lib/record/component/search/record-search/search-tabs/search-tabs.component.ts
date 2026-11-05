// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Ripple } from '@openng/optimus-ui/ripple';
import { Tab, TabList, Tabs } from '@openng/optimus-ui/tabs';

import { RecordSearchStore } from '../../store/record-search.store';

@Component({
  selector: 'ng-core-search-tabs',
  templateUrl: './search-tabs.component.html',
  imports: [Tabs, TabList, Ripple, Tab, TranslatePipe],
})
export class SearchTabsComponent {
  private store = inject(RecordSearchStore);

  /** Tabs displayed (configs not flagged as hidden) */
  readonly typesInTabs = computed(() => this.store.configs().filter((item) => item.hideInTabs !== true));

  /** Currently selected tab, following the type of the store (e.g. set from the URL). */
  readonly currentType = this.store.currentType;

  /**
   * Switch to the type of the clicked tab.
   * @param type the key of the selected tab
   */
  selectType(type: string | number | undefined): void {
    if (typeof type === 'string' && type) {
      this.store.selectType(type);
    }
  }
}
