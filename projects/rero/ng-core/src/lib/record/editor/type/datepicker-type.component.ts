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
import { formatDate } from '@angular/common';
import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';

interface DatePickerProps extends FormlyFieldProps {
  placeholder?: string;
  readonly: boolean;
  placement: string;
  bsConfig: any;
  outsideClick: boolean;
  outputDateFormat: string;
}

/**
 * Component for displaying a datepicker field in editor.
 */
@Component({
  selector: 'ng-core-editor-datepicker-type',
  template: `
    <div class="input-group">
      <div class="input-group-prepend">
        <div class="input-group-text">
          <i class="fa fa-calendar" aria-hidden="true"></i>
        </div>
      </div>
      <input
        type="text"
        class="form-control"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [class.is-invalid]="showError"
        [placeholder]="props.placeholder"
        [readonly]="props.readonly"

        bsDatepicker
        [placement]="props.placement"
        [bsConfig]="props.bsConfig"
        [outsideClick]="props.outsideClick"
      >
    </div>
  `
})
export class DatepickerTypeComponent extends FieldType<FormlyFieldConfig<DatePickerProps>> implements OnInit {

  defaultOptions?: Partial<FormlyFieldConfig<DatePickerProps>> = {
    props: {
      placement: 'bottom',
      outsideClick: true,
      outputDateFormat: 'yyyy-MM-dd',
      readonly: false,
      bsConfig: {
        showWeekNumbers: false,
        containerClass: 'theme-dark-blue',
        dateInputFormat: 'YYYY-MM-DD'
      }
    }
  };

  /**
   * constructor
   * @param _locale - string
   */
  constructor(@Inject(LOCALE_ID) private _locale: string) {
    super();
  }

  /**
   * Init
   */
  ngOnInit() {
    this.initValueChange();
  }

  /**
   * Init value change on field
   */
  private initValueChange() {
    this.formControl.valueChanges.subscribe(isoDate => {
      let patchDate: any = null;
      if (isoDate != null) {  // if reset() function is called, 'null' is send
        try {
          const date = new Date(isoDate);
          patchDate = formatDate(
            date,
            this.field.props.outputDateFormat,
            this._locale
          );
        } catch {
          patchDate = undefined;
        }
      }
      if (this.formControl.value !== patchDate) {
        this.formControl.patchValue(patchDate);
      }
    });
  }
}
