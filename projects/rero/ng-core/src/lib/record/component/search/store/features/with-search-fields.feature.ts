/*
 * RERO angular core
 * Copyright (C) 2025 RERO
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
import { computed, Signal } from '@angular/core';
import { patchState, signalStoreFeature, type, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { filter, pipe, tap } from 'rxjs';
import { SearchField } from '../../../../../model/record.interface';
import { RecordType } from '../../../../model';
import { shallowEqual } from '../../../../record-search-utils';

/**
 * SignalStore feature for managing search fields.
 * Provides methods for handling search field selection.
 *
 * Requires searchFields state from withSearchParams (flat state).
 *
 * Methods:
 * - updateSearchFields(fields): Replace all search fields
 * - toggleSearchField(path): Toggle selection of a specific field
 * - selectAllSearchFields(): Select all available fields
 * - deselectAllSearchFields(): Deselect all fields
 * - clearSearchFields(): Remove all search fields
 *
 * Computed:
 * - selectedSearchFields: Array of currently selected fields
 * - hasSelectedFields: Boolean indicating if any field is selected
 */
export function withSearchFields() {
  return signalStoreFeature({
    state: type<{
      currentType: string;
      searchFields: SearchField[];
    }>(),
    props: type<{
      config: Signal<RecordType>;
      translateService?: TranslateService;
    }>()
  },
    withComputed((state) => ({
      /** Get only selected search fields */
      selectedSearchFields: computed(() =>
        state.searchFields().filter((field) => field.selected === true)
      ),
      /** Check if any search field is selected */
      hasSelectedFields: computed(() =>
        state.searchFields().some((field) => field.selected === true)
      )
    })),
    withMethods((store) => ({
      /**
       * Update the complete list of search fields.
       * @param searchFields - New list of search fields
       */
      updateSearchFields(searchFields: SearchField[]): void {
        patchState(store, { searchFields });
      },

      /**
       * Toggle the selection state of a specific search field.
       * @param path - The path of the field to toggle
       */
      toggleSearchField(path: string): void {
        const updatedFields = store.searchFields().map((field) =>
          field.path === path ? { ...field, selected: !field.selected } : field
        );
        patchState(store, { searchFields: updatedFields });
      },

      /**
       * Select all available search fields.
       */
      selectAllSearchFields(): void {
        const updatedFields = store.searchFields().map((field) => ({
          ...field,
          selected: true
        }));
        patchState(store, { searchFields: updatedFields });
      },

      /**
       * Deselect all search fields.
       */
      deselectAllSearchFields(): void {
        const updatedFields = store.searchFields().map((field) => ({
          ...field,
          selected: false
        }));
        patchState(store, { searchFields: updatedFields });
      },

      /**
       * Clear all search fields (reset to empty array).
       */
      clearSearchFields(): void {
        patchState(store, { searchFields: [] });
      },
    })),
    withMethods((store) => ({
      initializeSearchFields: rxMethod<{currentType: string, config: RecordType}>(
        pipe(
          filter((params) => !!params.currentType),
          filter((params) => params.config.searchFields.length > 0),
          tap((params) => {
            const configFields = params.config.searchFields;
            const fieldsWithSelection = configFields.map((field) => ({
              ...field,
              label: store.translateService?.instant
                ? store.translateService.instant(field.label)
                : field.label,
              selected: field.selected ?? false,
            }));

            if (!shallowEqual(fieldsWithSelection, store.searchFields())) {
              store.updateSearchFields(fieldsWithSelection);
            }
          },
          ))),
    })),
    withHooks((store) => ({
      onInit() {
        store.initializeSearchFields(computed(() => ({currentType: store.currentType(), config:store.config()})));
      }
    })),
  );
}
