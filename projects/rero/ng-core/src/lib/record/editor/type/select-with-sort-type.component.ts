/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { FormlyFieldSelect } from '@ngx-formly/bootstrap';

@Component({
  selector: 'ng-core-editor-select-with-sort-type',
  template: `
    <select
    *ngIf="to.multiple; else singleSelect"
    class="form-control"
    multiple
    [formControl]="formControl"
    [class.is-invalid]="showError"
    [formlyAttributes]="field"
    >
      <ng-container *ngIf="to.options | formlySelectOptions: field | async as opts">
        <ng-container *ngIf="to._flatOptions; else grouplist">
          <ng-container *ngFor="let opt of opts | sortByKeys:order">
            <option [ngValue]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
          </ng-container>
        </ng-container>

        <ng-template #grouplist>
          <ng-container *ngFor="let opt of opts | sortByKeys:order">
            <option *ngIf="!opt.group; else optgroup" [ngValue]="opt.value" [disabled]="opt.disabled">{{
              opt.label
            }}</option>
            <ng-template #optgroup>
              <optgroup [label]="opt.label">
                <option *ngFor="let child of opt.group | sortByKeys:order" [ngValue]="child.value" [disabled]="child.disabled">
                  {{ child.label }}
                </option>
              </optgroup>
            </ng-template>
          </ng-container>
        </ng-template>
      </ng-container>
    </select>
    <ng-template #singleSelect>
      <select
        class="form-control"
        [formControl]="formControl"
        [compareWith]="to.compareWith"
        [class.custom-select]="to.customSelect"
        [class.is-invalid]="showError"
        [formlyAttributes]="field"
      >
        <option *ngIf="to.placeholder" [ngValue]="undefined">{{ to.placeholder }}</option>
        <ng-container *ngIf="to.options | formlySelectOptions: field | async as opts">
          <ng-container *ngIf="to._flatOptions; else grouplist">
            <ng-container *ngFor="let opt of opts | sortByKeys:order">
              <option [ngValue]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
            </ng-container>
          </ng-container>

          <ng-template #grouplist>
            <ng-container *ngFor="let opt of opts">
              <option *ngIf="!opt.group; else optgroup" [ngValue]="opt.value" [disabled]="opt.disabled">{{
                opt.label
              }}</option>
              <ng-template #optgroup>
                <optgroup [label]="opt.label">
                  <option *ngFor="let child of opt.group" [ngValue]="child.value" [disabled]="child.disabled">
                    {{ child.label }}
                  </option>
                </optgroup>
              </ng-template>
            </ng-container>
          </ng-template>
        </ng-container>
      </select>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectWithSortTypeComponent extends FormlyFieldSelect implements OnInit {
  /**
   * Menu order (Default order: label, desc ex: '-label')
   */
  public order = 'label';

  /** Constructor */
  constructor(ngZone: NgZone) {
    super(ngZone);
  }

  /** Init */
  ngOnInit() {
    const templateOptions = this.field.templateOptions;
    if ('selectWithSortOptions' in templateOptions) {
      if ('order' in templateOptions.selectWithSortOptions) {
        this.order = templateOptions.selectWithSortOptions.order;
      }
    }
  }
}
