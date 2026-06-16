// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, computed, effect, inject, model } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Ripple } from 'primeng/ripple';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { RecordSearchStore } from '../../store/record-search.store';

// Documentation: https://primeng.org/tabview

@Component({
  selector: 'ng-core-search-tabs',
  templateUrl: './search-tabs.component.html',
  imports: [Tabs, TabList, Ripple, Tab, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchTabsComponent {
  private store = inject(RecordSearchStore);
  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  /** Tabs displayed (configs not flagged as hidden) */
  readonly typesInTabs = computed(() => this.store.configs().filter((item) => item.hideInTabs !== true));

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
