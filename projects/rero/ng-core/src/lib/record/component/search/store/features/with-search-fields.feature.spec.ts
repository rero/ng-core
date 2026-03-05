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
import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { SearchField } from '../../../../../model/record.interface';
import { withConfig } from './with-config.feature';
import { withSearchParams } from './with-search-params.feature';
import { withSearchFields } from './with-search-fields.feature';

describe('withSearchFields', () => {
  const TestStore = signalStore({ providedIn: 'root' }, withSearchParams(), withConfig(), withSearchFields());
  type TestStore = InstanceType<typeof TestStore>;
  let store: TestStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestStore],
    });
    store = TestBed.inject(TestStore);
  });

  describe('Initial State', () => {
    it('should initialize with empty searchFields array', () => {
      expect(store.searchFields()).toEqual([]);
    });

    it('should have no selected fields initially', () => {
      expect(store.selectedSearchFields()).toEqual([]);
      expect(store.hasSelectedFields()).toBe(false);
    });
  });

  describe('updateSearchFields', () => {
    it('should update the search fields list', () => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: false },
        { label: 'Author', path: 'author', selected: true },
      ];

      store.updateSearchFields(fields);

      expect(store.searchFields()).toEqual(fields);
    });

    it('should replace existing fields', () => {
      const initialFields: SearchField[] = [{ label: 'Title', path: 'title', selected: true }];
      const newFields: SearchField[] = [{ label: 'Subject', path: 'subject', selected: false }];

      store.updateSearchFields(initialFields);
      store.updateSearchFields(newFields);

      expect(store.searchFields()).toEqual(newFields);
      expect(store.searchFields().length).toBe(1);
    });
  });

  describe('toggleSearchField', () => {
    beforeEach(() => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: false },
        { label: 'Author', path: 'author', selected: true },
        { label: 'Subject', path: 'subject', selected: false },
      ];
      store.updateSearchFields(fields);
    });

    it('should toggle field from unselected to selected', () => {
      store.toggleSearchField('title');

      const titleField = store.searchFields().find((f) => f.path === 'title');
      expect(titleField?.selected).toBe(true);
    });

    it('should toggle field from selected to unselected', () => {
      store.toggleSearchField('author');

      const authorField = store.searchFields().find((f) => f.path === 'author');
      expect(authorField?.selected).toBe(false);
    });

    it('should only affect the specified field', () => {
      store.toggleSearchField('title');

      expect(store.searchFields()[0].selected).toBe(true); // title
      expect(store.searchFields()[1].selected).toBe(true); // author unchanged
      expect(store.searchFields()[2].selected).toBe(false); // subject unchanged
    });

    it('should handle non-existent field path gracefully', () => {
      const beforeState = store.searchFields();
      store.toggleSearchField('nonexistent');

      expect(store.searchFields()).toEqual(beforeState);
    });
  });

  describe('selectAllSearchFields', () => {
    it('should select all fields', () => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: false },
        { label: 'Author', path: 'author', selected: false },
        { label: 'Subject', path: 'subject', selected: true },
      ];
      store.updateSearchFields(fields);

      store.selectAllSearchFields();

      expect(store.searchFields().every((f) => f.selected === true)).toBe(true);
      expect(store.selectedSearchFields().length).toBe(3);
    });

    it('should work with empty fields array', () => {
      store.selectAllSearchFields();

      expect(store.searchFields()).toEqual([]);
    });
  });

  describe('deselectAllSearchFields', () => {
    it('should deselect all fields', () => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: true },
        { label: 'Author', path: 'author', selected: true },
        { label: 'Subject', path: 'subject', selected: false },
      ];
      store.updateSearchFields(fields);

      store.deselectAllSearchFields();

      expect(store.searchFields().every((f) => f.selected === false)).toBe(true);
      expect(store.selectedSearchFields().length).toBe(0);
      expect(store.hasSelectedFields()).toBe(false);
    });
  });

  describe('clearSearchFields', () => {
    it('should reset fields to empty array', () => {
      const fields: SearchField[] = [{ label: 'Title', path: 'title', selected: true }];
      store.updateSearchFields(fields);

      store.clearSearchFields();

      expect(store.searchFields()).toEqual([]);
      expect(store.selectedSearchFields()).toEqual([]);
    });
  });

  describe('Computed: selectedSearchFields', () => {
    it('should return only selected fields', () => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: true },
        { label: 'Author', path: 'author', selected: false },
        { label: 'Subject', path: 'subject', selected: true },
      ];
      store.updateSearchFields(fields);

      const selected = store.selectedSearchFields();

      expect(selected.length).toBe(2);
      expect(selected[0].path).toBe('title');
      expect(selected[1].path).toBe('subject');
    });

    it('should return empty array when no fields are selected', () => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: false },
        { label: 'Author', path: 'author', selected: false },
      ];
      store.updateSearchFields(fields);

      expect(store.selectedSearchFields()).toEqual([]);
    });
  });

  describe('Computed: hasSelectedFields', () => {
    it('should return true when at least one field is selected', () => {
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: false },
        { label: 'Author', path: 'author', selected: true },
      ];
      store.updateSearchFields(fields);

      expect(store.hasSelectedFields()).toBe(true);
    });

    it('should return false when no fields are selected', () => {
      const fields: SearchField[] = [{ label: 'Title', path: 'title', selected: false }];
      store.updateSearchFields(fields);

      expect(store.hasSelectedFields()).toBe(false);
    });

    it('should return false for empty fields array', () => {
      expect(store.hasSelectedFields()).toBe(false);
    });
  });

  describe('Integration Workflows', () => {
    it('should handle complete field management workflow', () => {
      // Initial load
      const fields: SearchField[] = [
        { label: 'Title', path: 'title', selected: false },
        { label: 'Author', path: 'author', selected: false },
      ];
      store.updateSearchFields(fields);
      expect(store.hasSelectedFields()).toBe(false);

      // User selects all
      store.selectAllSearchFields();
      expect(store.selectedSearchFields().length).toBe(2);

      // User toggles one field off
      store.toggleSearchField('title');
      expect(store.selectedSearchFields().length).toBe(1);
      expect(store.selectedSearchFields()[0].path).toBe('author');

      // User clears all
      store.deselectAllSearchFields();
      expect(store.hasSelectedFields()).toBe(false);
    });

    it('should maintain field properties during selection changes', () => {
      const fields: SearchField[] = [{ label: 'Document Title', path: 'metadata.title', selected: false }];
      store.updateSearchFields(fields);

      store.toggleSearchField('metadata.title');

      const field = store.searchFields()[0];
      expect(field.label).toBe('Document Title');
      expect(field.path).toBe('metadata.title');
      expect(field.selected).toBe(true);
    });
  });

  describe('initializeSearchFields', () => {
    it('should initialize fields from config when currentType changes', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            searchFields: [
              { label: 'title', path: 'metadata.title' },
              { label: 'author', path: 'metadata.author', selected: true },
            ],
          } as any,
        ],
      });

      store.setCurrentType('documents');

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(store.searchFields().length).toBe(2);
      expect(store.searchFields()[0].label).toBe('title');
      expect(store.searchFields()[0].selected).toBe(false);
      expect(store.searchFields()[1].selected).toBe(true);
    });

    it('should not initialize fields when currentType is empty', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'documents',
            label: 'Documents',
            searchFields: [{ label: 'title', path: 'metadata.title' }],
          } as any,
        ],
      });

      await new Promise(resolve => setTimeout(resolve, 0));
      expect(store.searchFields()).toEqual([]);
    });
  });
});
