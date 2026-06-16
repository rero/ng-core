// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
