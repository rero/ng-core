// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Fieldset } from 'primeng/fieldset';
import { LabelComponent } from '../../component/label/label.component';

@Component({
  selector: 'ng-core-card-wrapper',
  template: `
    @if (!props.isRoot) {
      <p-fieldset>
        <ng-template #header>
          <ng-core-label-editor [field]="field" />
        </ng-template>
        <ng-template #fieldComponent></ng-template>
      </p-fieldset>
    } @else {
      <ng-template #fieldComponent></ng-template>
    }
  `,
  imports: [Fieldset, LabelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardWrapperComponent extends FieldWrapper implements OnInit {
  ngOnInit(): void {
    // remove the field label as it is displayed by this wrapper
    if (this.field.props) {
      this.field.props.hideLabel = true;
    }
  }
}
