// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, OnInit, runInInjectionContext, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { TranslateLabelService } from '../../service/translate-label.service';

export interface IMultiCheckBoxProps extends FormlyFieldProps {
  labelStyleClass?: string;
  style: 'stacked' | 'inline';
  styleClass?: string;
  options?: Observable<Record<string, unknown>[]>;
}

@Component({
  selector: 'ng-core-multi-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="core:flex"
      [ngClass]="{
        'core:gap-3': props.style === 'inline',
        'core:flex-col core:gap-1': props.style === 'stacked',
        'p-inputtext ng-invalid ng-dirty': showError,
      }"
    >
      @for (option of optionValues(); track $index) {
        @let fieldKey = field.key + '_' + $index;
        <div class="core:flex core:items-center core:gap-2">
          <p-checkbox
            [disabled]="option.disabled"
            [formlyAttributes]="field"
            [inputId]="fieldKey"
            [name]="$any(field.key)"
            [ngModel]="field.formControl.value"
            [readonly]="props.readonly"
            [class]="props.styleClass"
            [value]="option.value"
            (onChange)="onChange($event)"
          />
          <label [for]="fieldKey" [class]="props.labelStyleClass">{{ option.label }}</label>
        </div>
      }
    </div>
  `,
  imports: [NgClass, Checkbox, FormlyModule, FormsModule],
  providers: [TranslateLabelService],
})
export class MultiCheckboxComponent extends FieldType<FieldTypeConfig<IMultiCheckBoxProps>> implements OnInit {
  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private injector: Injector = inject(Injector);

  /** Default options */
  defaultOptions?: Partial<FieldTypeConfig<IMultiCheckBoxProps>> = {
    props: {
      style: 'stacked',
    },
  };

  optionValues!: Signal<any[]>;

  ngOnInit(): void {
    const optionsObs = this.props.options ?? of([]);
    const langChangeObs = this.translateService.onLangChange.pipe(startWith(null));
    this.optionValues = runInInjectionContext(this.injector, () =>
      toSignal(
        combineLatest([optionsObs, langChangeObs]).pipe(
          map(([options]) => this.translateLabelService.translateLabel(options)),
        ),
        { initialValue: [] },
      ),
    );
  }

  onChange(event: CheckboxChangeEvent): void {
    this.formControl?.patchValue(event.checked);
    this.formControl?.markAsTouched();
  }
}
