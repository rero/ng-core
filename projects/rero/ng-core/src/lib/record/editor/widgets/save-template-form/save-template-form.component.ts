/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
 * Copyright (C) 2020-2023 UCLouvain
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
import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ng-core-save-template-form',
  templateUrl: './save-template-form.component.html'
})
export class SaveTemplateFormComponent implements OnInit {

  /** form group */
  form: UntypedFormGroup = new UntypedFormGroup({});

  /** fields config of the form */
  formFields: FormlyFieldConfig[] = [];

  /** model of the form */
  model: FormModel;

  /** event fired when use click on save */
  saveEvent: EventEmitter<any> = new EventEmitter();

  /**
   * Constructor
   * @param translateService - TranslateService
   * @param bsModalRef - BsModalRef
   */
  constructor(
      private translateService: TranslateService,
      private bsModalRef: BsModalRef
  ) { }

  /**
   * Hook init
   */
  ngOnInit() {
    this.formFields.push({
      key: 'name',
      type: 'string',
      props: {
        required: true,
        placeholder: this.translateService.instant('Choose a name for your template'),
        minLength: 3,
      }
    });
  }

  /**
   * Submit the form
   */
  onSubmitForm() {
    this.saveEvent.emit(this.form.value);
    this.closeModal();
  }

  /**
   * Close the modal dialog box
   */
  closeModal() {
    this.bsModalRef.hide();
  }

}

/**
 * Interface to define fields on form
 */
interface FormModel {
  name: string;
}
