/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { Component, Signal, computed, inject, output } from '@angular/core';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { RecordSearchStore } from '../../store/record-search.store';

// Documentation: https://primeng.org/paginator

export interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export interface ChangeEvent {
  page: number;
  rows: number;
}

@Component({
    selector: 'ng-core-paginator',
    templateUrl: './paginator.component.html',
    imports: [Paginator]
})
export class PaginatorComponent {

  protected store = inject(RecordSearchStore);

  /** Emitted after a page/size change — lets parent trigger scroll-to-top */
  pageChanged = output<void>();

  alwaysShow: Signal<boolean> = computed(() => this.store.total() > this.store.size());
  currentPage: Signal<number> = computed(() => this.store.page());
  pageLinkSize: Signal<number> = computed(() => this.store.config().pagination.maxSize);
  rows: Signal<number> = computed(() => this.store.size());
  rowsPerPageOptions: Signal<number[]> = computed(() => this.store.config().pagination.rowsPerPageOptions);
  showCurrentPageReport: Signal<boolean> = computed(() => this.store.config().pagination.pageReport);
  showFirstLastIcon: Signal<boolean> = computed(() => this.store.config().pagination.boundaryLinks);
  totalRecords: Signal<number> = computed(() => this.store.total());

  /** Position offset for the current page (0-based, used by PrimeNG paginator) */
  first: Signal<number> = computed(() => (this.store.page() - 1) * this.store.size());

  /** Event on change page */
  onPageChange(event: PaginatorState) {
    if (event.rows !== undefined) {
      this.store.updateSize(event.rows);
    }
    if (event.page !== undefined) {
      this.store.updatePage(event.page + 1);
    }
    this.pageChanged.emit();
  }
}
