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

import { Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { Fieldset } from 'primeng/fieldset';
import { LabelComponent } from '../../component/label/label.component';

@Component({
    selector: 'ng-core-card-wrapper',
    template: `
    <p-fieldset>
      @if (!props.isRoot) {
        <ng-template #header>
            <ng-core-label-editor [field]="field" />
        </ng-template>
      }
      <ng-template #fieldComponent></ng-template>
    </p-fieldset>
  `,
    imports: [Fieldset, LabelComponent]
})
export class CardWrapperComponent extends FieldWrapper implements OnInit {

  ngOnInit(): void {
    // remove the field label as it is displayed by this wrapper
    if (this.field.props) {
      this.field.props.hideLabel = true;
    }
  }
}
