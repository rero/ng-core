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

import { Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-card-wrapper',
  template: `
  <p-card>
    <ng-template pTemplate="header">
      <ng-core-label-editor [field]="field"></ng-core-label-editor>
    </ng-template>
    <ng-template #fieldComponent></ng-template>
  </p-card>
  `,
  styles: [
    `
      .card-header {
        padding: .25rem 1rem;
      }
      .card-body {
        padding: .25rem 1rem;
      }
    `
  ]
})
export class CardWrapperComponent extends FieldWrapper implements OnInit{

  /** OnInit hook */
  ngOnInit() {
    // remove the field label as it is displayed by this wrapper
    this.field.props.hideLabel = true;
  }

}
