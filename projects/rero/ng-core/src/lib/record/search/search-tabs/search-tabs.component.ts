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
import { Component, OnInit, inject, input, output, model, OnDestroy, OutputRefSubscription } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Documentation: https://primeng.org/tabview

export interface ITabViewChangeEvent {
  originalEvent: any;
  index: number;
};

@Component({
    selector: 'ng-core-search-tabs',
    templateUrl: './search-tabs.component.html',
    standalone: false
})
export class SearchTabsComponent implements OnInit, OnDestroy {

  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  // Resources configuration
  types = input.required<any>();

  // Tab change event
  onChangeType = output<string>();

  /** Tabs displayed */
  typesInTabs: any[];

  /** Tab index */
  currentType = model<string | undefined>(undefined);
  currentTypeSubscription: OutputRefSubscription;

  /** OnInit hook */
  ngOnInit(): void {
    this.typesInTabs = this.types().filter((item: any) => item.hideInTabs !== true);
    this.currentType.set(this.activatedRoute.snapshot.params.type);
    this.currentTypeSubscription = this.currentType.subscribe(typeName => this.onChangeType.emit(typeName));
  }

  ngOnDestroy(): void {
    this.currentTypeSubscription.unsubscribe();
  }
}
