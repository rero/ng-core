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
import { AsyncPipe, KeyValuePipe, NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldProps, FormlyModule } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { Checkbox, CheckboxChangeEvent } from 'primeng/checkbox';
import { combineLatest, map, Observable, of, startWith, Subscription } from 'rxjs';
import { TranslateLabelService } from '../../service/translate-label.service';

export interface IMultiCheckBoxProps extends FormlyFieldProps {
  labelStyleClass?: string;
  style: 'stacked' | 'inline';
  styleClass?: string;
  options?: Observable<Record<string, unknown>[]>;
}

@Component({
    selector: 'ng-core-multi-checkbox',
    template: `
    <div class="core:flex" [ngClass]="{ 'core:gap-3': props.style === 'inline', 'core:flex-col core:gap-1': props.style === 'stacked', 'p-inputtext ng-invalid ng-dirty': showError }">
    @for (option of optionValues$|async|keyvalue; track option.key) {
      @let fieldKey = field.key + '_' + option.key;
      <div class="core:flex core:items-center core:gap-2">
        <p-checkbox
          [disabled]="option.value.disabled"
          [formlyAttributes]="field"
          [inputId]="fieldKey"
          [name]="$any(field.key)"
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
    imports: [NgClass, Checkbox, FormlyModule, FormsModule, AsyncPipe, KeyValuePipe],
    providers: [TranslateLabelService]
})
export class MultiCheckboxComponent extends FieldType<FieldTypeConfig<IMultiCheckBoxProps>> implements OnInit, OnDestroy {

  private translateService: TranslateService = inject(TranslateService);
  private translateLabelService: TranslateLabelService = inject(TranslateLabelService);
  private ref: ChangeDetectorRef = inject(ChangeDetectorRef);

  private subscription: Subscription = new Subscription();

  /** Default options */
  defaultOptions?: Partial<FieldTypeConfig<IMultiCheckBoxProps>> = {
    props: {
      style: 'stacked'
    }
  };

  optionValues$: Observable<any[]> | null = null;

  multiCheckBoxValue: string[] = [];

  ngOnInit(): void {
    const optionsObs = this.props.options ?? of([]);
    const langChangeObs = this.translateService.onLangChange.pipe(startWith(null));
    this.optionValues$ = combineLatest([optionsObs, langChangeObs])
    .pipe(
      map(([options]) => {
        this.ref.markForCheck();
        return this.translateLabelService.translateLabel(options);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onChange(event: CheckboxChangeEvent): void {
    this.formControl?.patchValue(event.checked);
    this.formControl?.markAsTouched();
  }
}
