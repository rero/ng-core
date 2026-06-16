// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, runInInjectionContext, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { RadioButton } from 'primeng/radiobutton';
import { Observable, of } from 'rxjs';

interface RadioButtonProps {
  options: Observable<Option[]>;
  style: 'stacked' | 'inline';
}

interface Option {
  label: string;
  value: string;
  disabled: boolean;
}

@Component({
  selector: 'ng-core-editor-field-radio-button',
  template: `
    <ng-template #radioButton let-option="option" let-class="class">
      <div class="core:flex">
        <p-radiobutton
          [inputId]="option.value"
          [formControl]="option.disabled ? disabledControl : formControl"
          [value]="option.value"
        />
        <label [for]="option.value" class="core:ml-1">{{ option.untranslatedLabel | translate }}</label>
      </div>
    </ng-template>
    @if (props.style === 'stacked') {
      @for (option of optionValues(); track option.value) {
        <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{ option }" />
      }
    } @else {
      <div class="core:flex core:gap-2">
        @for (option of optionValues(); track option.value) {
          <ng-container [ngTemplateOutlet]="radioButton" [ngTemplateOutletContext]="{ option }" />
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RadioButton, FormsModule, ReactiveFormsModule, NgTemplateOutlet, TranslatePipe],
})
export class RadioButtonComponent extends FieldType<FieldTypeConfig<RadioButtonProps>> implements OnInit {
  private injector = inject(Injector);

  defaultOptions?: Partial<FieldTypeConfig<RadioButtonProps>> = {
    props: {
      options: of([]),
      style: 'stacked',
    },
  };

  optionValues!: Signal<Option[]>;

  ngOnInit(): void {
    this.optionValues = runInInjectionContext(this.injector, () =>
      toSignal(this.props.options ?? of([]), { initialValue: [] })
    );
  }

  get disabledControl() {
    return new FormControl({ value: this.formControl.value, disabled: true });
  }
}
