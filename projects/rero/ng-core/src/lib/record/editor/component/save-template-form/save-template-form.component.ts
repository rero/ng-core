// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';

@Component({
  selector: 'ng-core-save-template-form',
  templateUrl: './save-template-form.component.html',
  imports: [FormsModule, ReactiveFormsModule, FormlyModule, Button, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveTemplateFormComponent implements OnInit {
  protected dynamicDialogRef: DynamicDialogRef = inject(DynamicDialogRef);
  protected translateService: TranslateService = inject(TranslateService);

  /** form group */
  form: UntypedFormGroup = new UntypedFormGroup({});

  /** fields config of the form */
  formFields: FormlyFieldConfig[] = [];

  /** model of the form */
  model: FormModel = { name: '' };

  ngOnInit() {
    this.formFields.push({
      key: 'name',
      type: 'string',
      props: {
        required: true,
        placeholder: this.translateService.instant('Choose a name for your template'),
        minLength: 3,
      },
    });
  }

  /**
   * Submit the form
   */
  onSubmitForm() {
    this.closeDialog(this.form.value);
  }

  /**
   * Close the modal dialog box
   */
  closeDialog(data?: FormModel) {
    this.dynamicDialogRef.close(data);
  }
}

/**
 * Interface to define fields on form
 */
interface FormModel {
  name: string;
}
