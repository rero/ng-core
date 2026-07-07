// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-select-dialog-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, FormlyModule, Button, TranslatePipe],
  template: `
    @if (isDataFormLoaded()) {
      <form [formGroup]="form">
        <div class="core:my-1 core:font-bold">{{ 'Select a tree' | translate }}</div>
        <formly-form [form]="form" [fields]="formFields" [model]="model" />
        <div class="core:flex core:justify-end core:gap-2 core:mt-2">
          <p-button [label]="'Cancel' | translate" [outlined]="true" severity="danger" (onClick)="close()" />
          <p-button [label]="'OK' | translate" [disabled]="form.status !== 'VALID'" (onClick)="close()" />
        </div>
      </form>
    }
  `,
})
export class SelectDialogFormComponent implements OnInit {
  private readonly dynamicDialogRef = inject(DynamicDialogRef);

  readonly form = new UntypedFormGroup({});

  readonly formFields: FormlyFieldConfig[] = [];

  model: { tree?: string } = {};

  /** Becomes true once the options are loaded, gating the form rendering. */
  readonly isDataFormLoaded = signal(false);

  ngOnInit(): void {
    // Declare the select field (options are filled asynchronously below).
    this.formFields.push({
      key: 'tree',
      type: 'select',
      props: {
        label: 'Tree',
        appendTo: 'body',
        autofocus: true,
        required: true,
        filter: true,
        options: [],
      },
    });

    // Simulate a backend load happening after the dialog is already open.
    of([
      { label: 'Baobab', value: 'baobab' },
      { label: 'Beech', value: 'beech' },
      { label: 'Birch', value: 'birch' },
      { label: 'Cypress', value: 'cypress' },
      { label: 'Epicea', value: 'epicea' },
      { label: 'Larch', value: 'larch' },
      { label: 'Maple', value: 'maple' },
      { label: 'Oak', value: 'oak' },
    ])
      .pipe(delay(500))
      .subscribe((options) => {
        this.formFields[0].props!.options = options;
        this.isDataFormLoaded.set(true);
      });
  }

  close(): void {
    this.dynamicDialogRef.close();
  }
}
