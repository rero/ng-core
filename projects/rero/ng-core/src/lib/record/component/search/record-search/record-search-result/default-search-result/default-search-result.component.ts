/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { RecordData } from '../../../../../../model';
import { DetailUrl, ResultItem } from '../../../../../model/result-item.interface';

/**
 * Component for displaying record as JSON in brief views.
 */
@Component({
  template: `
    {{ record() | json }}
    @if (detailUrl()) {
      <div class="core:my-4">
        @if (detailUrl()?.external === false) {
          <p-button outlined icon="pi pi-eye" [label]="'Show' | translate" [routerLink]="detailUrl()?.link" />
        } @else {
          <p-button outlined icon="pi pi-eye" [label]="'Show' | translate" (click)="openLink()" />
        }
      </div>
    }
  `,
  imports: [Button, RouterLink, JsonPipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultSearchResultComponent implements ResultItem {
  // Record data.
  record = input.required<RecordData>();

  // Type of resource.
  type = input.required<string>();

  // Info for detail URL link.
  detailUrl = input<DetailUrl>();

  openLink() {
    if (!this.detailUrl()) {
      return;
    }
    const detailUrl = this.detailUrl();
    if (detailUrl?.link) {
      window.location.href = detailUrl.link;
    }
  }
}
