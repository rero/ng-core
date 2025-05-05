/*
 * RERO angular core
 * Copyright (C) 2024-2025 RERO
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
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, NgModule, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FormlyFieldConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { map, merge, Observable, Subscription, switchMap } from 'rxjs';
import { TranslateLabelService } from '../services/translate-label.service';

export interface IMultiCheckBoxProps extends FormlyFieldProps {
  labelStyleClass?: string;
  style: 'stacked' | 'inline';
  styleClass?: string;
  options?: Observable<any[]>;
}

@Component({
    selector: 'ng-core-multi-checkbox',
    template: `
    <div class="core:flex" [ngClass]="{ 'core:gap-3': props.style === 'inline', 'core:flex-col core:gap-1': props.style === 'stacked' }">
    @for (option of optionValues$|async|keyvalue; track option) {
      @let fieldKey = field.key + '_' + option.key;
      <div class="core:flex core:items-center core:gap-2">
        <p-checkbox
          [disabled]="option.value.disabled"
          [formlyAttributes]="field"
          [inputId]="fieldKey"
          [name]="field.key"
          [ngModel]="field.formControl.value"
          [readonly]="props.readonly"
          [styleClass]="props.styleClass"
          [value]="option.value.value"
          (onChange)="onChange($event)"
        />
        <label [for]="fieldKey" [class]="props.labelStyleClass">{{ option.value.label }}</label>
      </div>
    }
    </div>
  `,
    standalone: false
})
export class MultiCheckboxComponent extends FieldType<FormlyFieldConfig<IMultiCheckBoxProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();

  /** Default options */
  defaultOptions?: Partial<FormlyFieldConfig<IMultiCheckBoxProps>> = {
    props: {
      style: 'stacked'
    }
  };

  optionValues$: Observable<any[]>;

  multiCheckBoxValue: string[] = [];

  ngOnInit(): void {
    const optionsObs = this.props.options;
    const changeObs = this.translateService.onLangChange.pipe(switchMap(() => this.optionValues$));
    this.optionValues$ = merge(...[optionsObs, changeObs])
    .pipe(
      map(options => {
        this.ref.markForCheck();
        return this.translateLabelService.translateLabel(options);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onChange(event: CheckboxChangeEvent): void {
    this.field.formControl.patchValue(event.checked);
  }
}

@NgModule({
  declarations: [MultiCheckboxComponent],
  imports: [
    CommonModule,
    CheckboxModule,
    FormsModule,
    TranslateModule.forChild(),
    FormlySelectModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'multi-checkbox',
          component: MultiCheckboxComponent,
          wrappers: ['form-field'],
        }
      ],
    }),
  ],
  exports: [MultiCheckboxComponent]
})
export class NgCoreFormlyMultiCheckboxModule { }
