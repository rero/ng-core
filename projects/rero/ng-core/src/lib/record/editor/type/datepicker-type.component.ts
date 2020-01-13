/*
* Invenio angular core
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
import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'ng-core-editor-datepicker-type',
  template: `
    <input *ngIf="!to.range; else datePickerRange"
      type="text"
      class="form-control"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [class.is-invalid]="showError"
      bsDatepicker
      [placement]="to.placement"
      [bsConfig]="to.bsConfig"
      [placeholder]="to.placeholder"
      [outsideClick]="to.outsideClick"
      [readonly]="to.readonly"
    >
    <ng-template #datePickerRange>
      <input
        type="text"
        class="form-control"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [class.is-invalid]="showError"
        bsDaterangepicker
        [placement]="to.placement"
        [bsConfig]="to.bsConfig"
        [placeholder]="to.placeholder"
        [outsideClick]="to.outsideClick"
        [readonly]="to.readonly"
      >
    </ng-template>
  `
})
export class DatepickerTypeComponent extends FieldType implements OnInit {

  ngOnInit() {
    // Default bsConfig options for DatePicker
    const bsConfig = {
      showWeekNumbers: false,
      containerClass: 'theme-dark-blue',
      dateInputFormat: 'YYYY-MM-DD'
    };
    if ('bsConfig' in this.field.templateOptions) {
      this.field.templateOptions.bsConfig = {
        ...bsConfig,
        ...this.field.templateOptions.bsConfig
      };
    } else {
      this.field.templateOptions.bsConfig = bsConfig;
    }
    if (!('range' in this.field.templateOptions)) {
      this.field.templateOptions.range = false;
    }
    if (!('placement' in this.field.templateOptions)) {
      this.field.templateOptions.placement = 'bottom';
    }
    if (!('outsideClick' in this.field.templateOptions)) {
      this.field.templateOptions.outsideClick = true;
    }
  }
}
