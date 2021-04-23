/*
 * RERO angular core
 * Copyright (C) 2021 RERO
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
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { isObservable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SelectOption } from './interfaces';

/**
 * Component to display a custom select box, with additional features.
 */
@Component({
  selector: 'ng-core-editor-formly-field-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
})
export class CustomSelectFieldComponent extends FieldType implements OnDestroy, OnInit {
  // Component default options
  defaultOptions = {
    templateOptions: {
      minItemsToDisplaySearch: 10,
      sort: true,
    },
  };

  // Current selected option
  selectedOption: SelectOption;

  // List of options
  optionsList: Array<SelectOption> = [];

  // Filter value to filter options
  filter: string = null;

  // Subscriptions to observables.
  private _subscriptions: Subscription = new Subscription();

  /**
   * Constructor
   *
   * @param _changeDetectorRef Change detector reference.
   * @param _translateService Translate servive.
   */
  constructor(private _changeDetectorRef: ChangeDetectorRef, private _translateService: TranslateService) {
    super();
  }

  /**
   * Component initialization.
   */
  ngOnInit(): void {
    // Convert options to observable if not the case.
    if (!isObservable(this.to.options)) {
      this.to.options = of(this.to.options);
    }

    // Process options by flatten the tree and translate labels.
    this._subscriptions.add(
      this.to.options.subscribe((options) => {
        this._extract_groups(options);
        this.optionsList = this._prependPreferred(this._processOptions(options));

        // Select the option for current value.
        if (this.formControl.value != null) {
          this.selectedOption = this.optionsList.find((option) => option?.value === this.formControl.value);
          // Call this to refresh the selected option in template.
          this._changeDetectorRef.markForCheck();
        }
      })
    );

    // Re-translate options when language changes.
    this._subscriptions.add(
      this._translateService.onLangChange
        .pipe(
          switchMap(() => {
            return this.to.options;
          })
        )
        .subscribe((options) => {
          this._extract_groups(options);
          this.optionsList = this._prependPreferred(this._processOptions(options));

          // Update selected option
          if (this.selectedOption) {
            this.selectedOption = this.optionsList.find((option) => option.value === this.selectedOption.value);
          }
        })
    );

    // If value externally changed, the selected option must be updated.
    this._subscriptions.add(
      this.formControl.valueChanges.subscribe((value) => {
        this.selectedOption = this.optionsList.find((option) => option.value === value);
        // Call this to refresh the selected option in template.
        this._changeDetectorRef.markForCheck();
      })
    );
  }

  /**
   * Component destruction.
   */
  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /**
   * Return the filter options.
   *
   * @returns An array of filtered options.
   */
  get filteredOptions(): Array<SelectOption> {
    if (!this.filter) {
      return this.optionsList;
    }
    return this.optionsList.filter(
      (option) => !option.preferred && option.translatedLabel.toLowerCase().indexOf(this.filter.toLowerCase()) !== -1
    );
  }

  /**
   * Store the filter value.
   *
   * @param filter Search filter value.
   */
  onFilterChange(filter: string): void {
    this.filter = filter;
  }

  /**
   * Store the selected option, when option is clicked in the list.
   *
   * @param option The clicked option.
   */
  selectOption(option: SelectOption): void {
    this.selectedOption = option;
    this.formControl.patchValue(option.value);
    this.filter = null;
  }

  /**
   * Translate, sort and flatten the options tree to display it in the select box.
   *
   * @param options List of options.
   * @param level Current level in the hierarchy.
   * @returns Flattened options.
   */
  private _processOptions(options: Array<SelectOption>, level = 0): Array<SelectOption> {
    let items = [];

    // Translate the options
    options = options.map((option) => {
      option.translatedLabel = this._translateService.instant(option.label);
      return option;
    });

    // Sort the items
    if (this.to.sort) {
      options.sort((a, b) => {
        return a.translatedLabel.localeCompare(b.translatedLabel);
      });
    }

    options.forEach((option) => {
      let newLevel = (option.level = level);
      items.push({ ...option });
      // process children recursively
      if (option.children) {
        newLevel++;
        items = [...items, ...this._processOptions(option.children, newLevel)];
      }
    });

    level++;

    return items;
  }

  /**
   * Add preferred option to the top of the list.
   *
   * @param options Options list.
   * @returns New list with preferred options at the beginning.
   */
  private _prependPreferred(options: Array<SelectOption>): Array<SelectOption> {
    const preferred = [];

    options.forEach((option: SelectOption) => {
      if (option.preferred) {
        const newPreferredOption = { ...option };
        // Preferred option is in root level.
        newPreferredOption.level = 0;
        preferred.push(newPreferredOption);
        delete option.preferred;
      }
    });

    // Push a separator to visually identify the preferred options.
    if (preferred.length > 0) {
      preferred.push({ label: '------------', translatedLabel: '------------' });
    }

    return [...preferred, ...options];
  }

  /**
   * Extract `group` property from options and create a new group with children from it.
   *
   * @param options List of options.
   */
  private _extract_groups(options: Array<SelectOption>): void {
    options.forEach((option, index) => {
      // Group is found
      if (option.group) {
        let groupOption = options.find((item) => item.label === option.group);
        // No group exists at this time
        if (!groupOption) {
          groupOption = { label: option.group, children: [] };
          options.push(groupOption);
        }

        // Add option to group...
        groupOption.children.push({ ...option });
        // ...and remove it from array.
        options.splice(index, 1);
      }
    });
  }
}
