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
import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';

export interface NgCoreFormlyInputFieldConfig extends FormlyFieldConfig {
  type: 'input' | Type<NgCoreFormlyFieldInput>;
  addonRight?: string[];
  addonLeft?: string[];
}

@Component({
  selector: 'ng-core-formly-field-primeng-input',
  template: `
    @if (props.addonLeft || props.addonRight) {
      <p-inputGroup>
          @if (props.addonLeft) {
            @for (prop of props.addonLeft; track prop) {
              <p-inputGroupAddon [innerHTML]="prop"></p-inputGroupAddon>
            }
          }
          @if (props.type !== 'number') {
            <input
              pInputText
              class="w-full"
              [type]="props.type || 'text'"
              [formControl]="formControl"
              [formlyAttributes]="field"
            />
          } @else {
            <input type="number" pInputText [formControl]="formControl" [formlyAttributes]="field" />
          }
          @if (props.addonRight) {
            @for (prop of props.addonRight; track prop) {
              <p-inputGroupAddon [innerHTML]="prop"></p-inputGroupAddon>
            }
          }
      </p-inputGroup>
    } @else {
      @if (props.type !== 'number') {
        <input
          pInputText
          class="w-full"
          [type]="props.type || 'text'"
          [formControl]="formControl"
          [formlyAttributes]="field"
        />
      } @else {
        <input type="number" pInputText [formControl]="formControl" [formlyAttributes]="field" />
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgCoreFormlyFieldInput extends FieldType<NgCoreFormlyInputFieldConfig> {}
