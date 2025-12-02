/*
 * RERO angular core
 * Copyright (C) 2019-2025 RERO
 * Copyright (C) 2019-2023 UCLouvain
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
import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  inputBinding,
  output,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ActionStatus, DEFAULT_ACTION_STATUS, RecordData } from '../../../../../model';
import { DetailUrl } from '../../../../model/result-item.interface';
import { RecordSearchStore } from '../../store/record-search.store';
import { DefaultSearchResultComponent } from './default-search-result/default-search-result.component';

export interface IDeleteRecordEvent {
  pid: string;
  type?: string;
}

@Component({
  selector: 'ng-core-record-search-result',
  templateUrl: './record-search-result.component.html',
  imports: [Button, RouterLink, Tooltip, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordSearchResultComponent {
  protected router: Router = inject(Router);
  protected store = inject(RecordSearchStore);

  // Store current URL to come back to the same page
  currentUrl: string | null = null;

  // Record to display (only input needed)
  readonly record = input.required<RecordData>();

  // Create observable from record signal (as class property for injection context)
  // Use distinctUntilChanged to avoid re-emitting the same record
  private readonly record$ = toObservable(this.record).pipe(distinctUntilChanged((a, b) => a?.id === b?.id));

  // Convert observables to signals directly - more efficient than manual subscriptions
  readonly deleteStatus = toSignal(this.record$.pipe(switchMap((record) => this.store.canDeleteRecord$(record))), {
    initialValue: DEFAULT_ACTION_STATUS,
  });

  readonly updateStatus = toSignal(this.record$.pipe(switchMap((record) => this.store.canUpdateRecord$(record))), {
    initialValue: DEFAULT_ACTION_STATUS,
  });

  readonly useStatus = toSignal(this.record$.pipe(switchMap((record) => this.store.canUseRecord$(record))), {
    initialValue: DEFAULT_ACTION_STATUS,
  });

  readonly detailUrl = toSignal(this.record$.pipe(switchMap((record) => this.resolveDetailUrl(record))), {
    initialValue: { link: '', external: false },
  });

  // Get type from store
  readonly type = computed(() => this.store.currentType());

  // Get component view from store config
  readonly itemViewComponent = computed(() => this.store.config().component);

  // Get admin mode from store routeConfig
  readonly adminMode = toSignal(this.store.routeConfig().adminMode(), {
    initialValue: DEFAULT_ACTION_STATUS,
  });

  // Event emitted when a record is deleted
  readonly deletedRecord = output<IDeleteRecordEvent>();

  readonly deleteMessageEvent = output<string>();

  // Location for component item creation
  readonly container = viewChild.required('item', { read: ViewContainerRef });

  // Return a message containing the reasons why the item cannot be deleted
  readonly deleteInfoMessage = computed(() => this.deleteStatus().message || '');

  // Helper computed for template access
  readonly useStatusUrl = computed(() => this.useStatus().url);

  readonly updateStatusRouterLink = computed(() => this.updateStatus().routerLink);

  readonly deleteStatusType = computed(() => this.deleteStatus().type);

  constructor() {
    this.currentUrl = window.location.href;

    // Effect to create/update the dynamic component when dependencies change
    effect(() => {
      const container = this.container();
      const component = this.itemViewComponent();
      const record = this.record();
      const type = this.type();
      const detailUrl = this.detailUrl();

      // Clear and create component
      container.clear();
      container.createComponent(component || DefaultSearchResultComponent, {
        bindings: [
          inputBinding('record', () => record),
          inputBinding('type', () => type),
          inputBinding('detailUrl', () => detailUrl),
        ],
      });
    });
  }

  /**
   * Resolves detail URL for a record
   * @param record - Record to resolve URL for
   * @returns Observable with detail URL
   */
  private resolveDetailUrl(record: RecordData): Observable<DetailUrl> {
    const url = { link: `detail/${record.id}`, external: false };

    const detailUrl = this.store.routeConfig().detailUrl;
    if (detailUrl) {
      url.link = detailUrl.replace(':type', this.store.currentIndex()).replace(':pid', record.id);
      url.external = true;
    }

    if (!this.store.config()?.canRead) {
      return of(url);
    }

    return this.store.canReadRecord$(record).pipe(
      map((status: ActionStatus) => {
        if (status.can === false) {
          return { link: '', external: false };
        }
        return url;
      }),
    );
  }

  /**
   * Delete a record
   * @param pid - string, pid to delete
   * @param type - string, resource type
   */
  deleteRecord(pid: string, type?: string): void {
    const status = this.deleteStatus();
    if (status.can) {
      this.deletedRecord.emit({ pid, type });
    } else {
      if (status.message) {
        this.deleteMessageEvent.emit(status.message.replace(new RegExp('\\n', 'g'), '<br>'));
      }
    }
  }

  /**
   * Use a record
   */
  useRecord() {
    const status = this.useStatus();
    if ('url' in status && status.url) {
      this.router.navigateByUrl(status.url);
    }
  }
}
