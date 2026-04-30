/*
 * RERO angular core
 * Copyright (C) 2020-2025 RERO
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
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateDirective, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Message } from 'primeng/message';
import { CONFIG } from '../../../../core';
import { RecordService } from '../../../service/record/record.service';
import { TemplatesService } from '../../services/template/templates.service';

@Component({
  selector: 'ng-core-load-template-form',
  templateUrl: './load-template-form.component.html',
  imports: [FormsModule, ReactiveFormsModule, Message, TranslateDirective, FormlyModule, Button, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadTemplateFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected dynamicDialogRef: DynamicDialogRef = inject(DynamicDialogRef);
  protected dynamicDialogConfig: DynamicDialogConfig = inject(DynamicDialogConfig);
  protected recordService: RecordService = inject(RecordService);
  protected templateService: TemplatesService = inject(TemplatesService);
  protected translateService: TranslateService = inject(TranslateService);
  protected router: Router = inject(Router);
  protected messageService: MessageService = inject(MessageService);

  /** form group */
  form: UntypedFormGroup = new UntypedFormGroup({});

  /** fields config of the form */
  formFields: FormlyFieldConfig[] = [];

  /** model of the form */
  model: FormModel = {};

  isDataFormLoaded = signal(false);

  isVisible = true;

  ngOnInit() {
    const { data } = this.dynamicDialogConfig;

    this.formFields.push({
      key: 'template',
      type: 'select',
      props: {
        appendTo: 'body',
        required: true,
        group: true,
        filter: true,
        scrollHeight: CONFIG.DEFAULT_SELECT_SCROLL_HEIGHT,
        options: [],
        attributes: {
          size: 10,
        },
      },
    });

    this.templateService
      .getTemplates(data.templateResourceType, data.resourceType)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((templates) => {
        const items: { label: string; untranslatedLabel: string; items: { label: string; value: string }[] }[] = [];
        // private first
        const privateItems = templates.filter((template) => template.visibility === 'private');
        if (privateItems?.length > 0) {
          items.push({
            label: this.translateService.instant('My private templates'),
            untranslatedLabel: 'My private templates',
            items: privateItems.map((item) => ({
              label: item.name!,
              value: item.pid!,
            })),
          });
        }
        // public last
        const publicItems = templates.filter((template) => template.visibility === 'public');

        if (publicItems?.length > 0) {
          items.push({
            label: this.translateService.instant('Public templates'),
            untranslatedLabel: 'Public templates',
            items: publicItems.map((item) => ({
              label: item.name!,
              value: item.pid!,
            })),
          });
        }
        if (!this.formFields[0].props) {
          this.formFields[0].props = {};
        }
        this.formFields[0].props.options = items;
        this.isDataFormLoaded.set(true);
      });
  }

  /**
   * Submit form hook.
   * Redirect to the same editor form url with query params related to the selected template.
   */
  onSubmitForm() {
    const formValues = this.form.value;
    this.recordService
      .getRecord('templates', formValues.template)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (template) => {
          this.router.navigate([], {
            queryParams: {
              source: 'templates',
              pid: template.id,
            },
            queryParamsHandling: 'merge',
            skipLocationChange: true,
          });
          this.closeDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('Error'),
            detail: error.message,
            sticky: true,
            closable: true,
          });
        },
      });
  }

  closeDialog(): void {
    this.dynamicDialogRef.close();
  }
}

/**
 * Interface to define fields on form
 */
interface FormModel {
  template?: string;
}
