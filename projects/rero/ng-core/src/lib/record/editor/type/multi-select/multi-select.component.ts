/*
 * RERO angular core
 * Copyright (C) 2021-2024 RERO
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
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, isObservable, of } from 'rxjs';

// MultiSelect options: https://primeng.org/multiselect
interface MultiSelectProps extends FormlyFieldProps {
  defaultGroupName: string;
  defaultPreferredLabel: string[];
  disabled: boolean;
  display: string;
  filter: boolean;
  filterPlaceHolder?: string;
  options: element[] | Observable<element[]>,
  readonly: boolean;
  resetFilterOnHide: boolean;
  showClear: boolean;
  showHeader: boolean;
  scrollHeight: string;
  sort: boolean;
  styleClass?: string;
}

interface element {
  label: string;
  value: string;
  preferred?: boolean;
  group?: string;
}

interface group {
  label: string;
  value: string;
  items: option[]
}

interface option {
  label: string;
  value: string;
}

@Component({
  selector: 'ng-core-multiselect',
  templateUrl: './multi-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiSelectComponent extends FieldType<FormlyFieldConfig<MultiSelectProps>> implements OnInit, OnDestroy {

  private translate = inject(TranslateService);

  defaultOptions = {
    props: {
      defaultGroupName: 'Other',
      defaultPreferredLabel: ['Preferred value', 'Preferred values'],
      disabled: false,
      display: 'chip',
      filter: true,
      options: [],
      readonly: false,
      resetFilterOnHide: false,
      showClear: true,
      showHeader: true,
      scrollHeight: '200px',
      sort: true
    }
  };

  // Options for select menu
  optionsList: group | option[] = [];

  // Enables you to define whether options should be grouped together
  isGroup: boolean = false;

  // Subscriptions to observables.
  private subscriptions: Subscription = new Subscription();

  get model(): any {
    return this.formControl.value;
  }

  set model(value: string[]) {
    if (value?.length === 0) {
      this.formControl.patchValue(null);
    } else {
      this.formControl.patchValue(value);
    }
    this.formControl.markAsTouched();
    this.formControl.updateValueAndValidity();
  }

  get invalidClass(): string {
    return this.formControl?.touched && this.formControl?.invalid ? 'ng-dirty ng-invalid' : '';
  }

  /** OnInit hook */
  ngOnInit(): void {
    if (this.props.defaultPreferredLabel.length !== 2) {
      throw new Error('The table of preferred values must contain 2 values (singular and plural)');
    }
    // Convert options to observable if not the case.
    if (!isObservable(this.props.options)) {
      this.props.options = of(this.props.options);
    }

    this.subscriptions.add(
      this.props.options.subscribe((options: any[]) => {
        this.optionsList = options.find((option: element) => option.group)
          ? this.processGroup(options)
          : this.processOptions(options)
      })
    );
  }

  /** OnDestroy hook */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Process options
   * If we have a preferred parameter on an item,
   * we add these values to the top of the table.
   * Otherwise, we don't treat it as an option.
   * @param options the select options
   * @returns The options array
   */
  private processOptions(options: element[]): option[] {
    if (this.props.sort) {
      options.sort((a, b) => a.label.localeCompare(b.label));
    }
    const preferred = options.filter((option: element) => option.preferred);
    if (preferred.length > 0) {
      this.isGroup = true;
      const section = this.props.defaultPreferredLabel;
      const preferredGroup = this.createGroupedStructure(
        this.translate.instant(preferred.length < 2 ? section[0] : section[1]),
        'preferred',
        preferred
      );
      const optionsGroup = this.createGroupedStructure(
        '------------',
        '------------',
        options.filter((option: element) => !option.preferred)
      );

      return [preferredGroup, optionsGroup];
    }

    return options;
  }

  /**
   * Process group
   * If we detect the group option in the select item,
   * we build an object with the tree structure.
   * @param options the select options
   * @returns the groups array
   */
  private processGroup(options: element[]): group[] {
    this.isGroup = true;
    const groups = [];
    const optionsGroups = options.filter((option: element) => option.group);
    // Search for options that don't have a group and assign them a default group name
    options.filter((option: element) => !option.group).map((el: element) => {
      el.group = this.props.defaultGroupName;
      optionsGroups.push(el)
    });

    optionsGroups.map((option: element) => {
      let group = groups.find((group: group) => group.value === option.group);
      if (!group) {
        group = this.createGroupedStructure(
          this.translate.instant(option.group),
          option.group.toLowerCase().replace(' ', '_')
        );
        groups.push(group);
      }
      group.items.push({ label: option.label, value: option.value });
    });

    return groups;
  }

  /**
   * Create grouped structure
   * @param label the label of the tree
   * @param value the value of the tree
   * @param items the item array (element interface)
   * @returns Object
   */
  private createGroupedStructure(label: string, value: string, items: element[] = []): group {
    return { label, value, items };
  }
}
