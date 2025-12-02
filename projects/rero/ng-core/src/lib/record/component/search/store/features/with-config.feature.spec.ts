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
import { of } from 'rxjs';
import { withConfig, DEFAULT_ROUTE_CONFIG, DEFAULT_RECORD_TYPE } from './with-config.feature';
import { withSearchParams } from './with-search-params.feature';

describe('withConfig', () => {
  const TestStore = signalStore({ providedIn: 'root' }, withSearchParams(), withConfig());
  type TestStore = InstanceType<typeof TestStore>;
  let store: TestStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TestStore],
    });
    store = TestBed.inject(TestStore);
  });

  describe('Initial State', () => {
    it('should initialize with default route config', () => {
      expect(store.routeConfig()).toEqual(DEFAULT_ROUTE_CONFIG);
    });

    it('should have default types array', () => {
      expect(store.configs()).toEqual(DEFAULT_ROUTE_CONFIG.types);
      expect(store.configs().length).toBe(1);
    });

    it('should initialize currentType as empty string', () => {
      expect(store.currentType()).toBe('');
    });
  });

  describe('updateRouteConfig()', () => {
    it('should update route configuration', () => {
      const newConfig = {
        detailUrl: 'records/:type/:pid',
        showSearchInput: false,
      };

      store.updateRouteConfig(newConfig);

      expect(store.routeConfig().detailUrl).toBe('records/:type/:pid');
      expect(store.routeConfig().showSearchInput).toBe(false);
    });

    it('should update types in route configuration', () => {
      const newTypes = [
        {
          key: 'documents',
          label: 'Documents',
        } as any,
        {
          key: 'persons',
          label: 'Persons',
        } as any,
      ];

      store.updateRouteConfig({ types: newTypes });

      expect(store.configs().length).toBe(2);
      expect(store.configs()[0].key).toBe('documents');
      expect(store.configs()[1].key).toBe('persons');
    });

    it('should merge types with DEFAULT_RECORD_TYPE', () => {
      const newTypes = [
        {
          key: 'custom',
          label: 'Custom',
        } as any,
      ];

      store.updateRouteConfig({ types: newTypes });

      const customType = store.configs()[0];
      expect(customType.key).toBe('custom');
      expect(customType.label).toBe('Custom');
      // Should have default properties merged
      expect(customType.exportFormats).toBeDefined();
      expect(customType.preFilters).toBeDefined();
    });

    it('should not update if config is the same (shallow equal)', () => {
      const initialConfig = store.routeConfig();

      store.updateRouteConfig({
        detailUrl: initialConfig.detailUrl,
        showSearchInput: initialConfig.showSearchInput,
        types: initialConfig.types,
      });

      // Config should remain the same reference
      expect(store.routeConfig()).toBe(initialConfig);
    });
  });

  describe('setCurrentType()', () => {
    it('should set the current type', () => {
      store.setCurrentType('documents');
      expect(store.currentType()).toBe('documents');
    });

    it('should not update if same type is set', () => {
      store.setCurrentType('documents');
      const firstType = store.currentType();
      store.setCurrentType('documents');
      expect(store.currentType()).toBe(firstType);
    });

    it('should update when a different type is set', () => {
      store.setCurrentType('documents');
      store.setCurrentType('persons');
      expect(store.currentType()).toBe('persons');
    });
  });

  describe('config computed', () => {
    it('should return DEFAULT_RECORD_TYPE when no currentType is set', () => {
      expect(store.config()).toBe(DEFAULT_RECORD_TYPE);
    });

    it('should return the matching config for currentType', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents' } as any, { key: 'persons', label: 'Persons' } as any],
      });
      store.setCurrentType('persons');

      expect(store.config().key).toBe('persons');
      expect(store.config().label).toBe('Persons');
    });

    it('should throw error for unknown config type', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents' } as any],
      });
      store.setCurrentType('unknown');

      expect(() => store.config()).toThrowError('Unknown config type: unknown');

      // Restore valid state
      store.setCurrentType('documents');
    });
  });

  describe('currentIndex computed', () => {
    it('should return index from config when available', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents', index: 'documents-index' } as any],
      });
      store.setCurrentType('documents');

      expect(store.currentIndex()).toBe('documents-index');
    });

    it('should fallback to key when index is empty', () => {
      store.updateRouteConfig({
        types: [{ key: 'books', label: 'Books', index: '' } as any],
      });
      store.setCurrentType('books');

      expect(store.currentIndex()).toBe('books');
    });
  });

  describe('aggregationsExpand computed', () => {
    it('should return array from config', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents', aggregationsExpand: ['author', 'year'] } as any],
      });
      store.setCurrentType('documents');

      expect(store.aggregationsExpand()).toEqual(['author', 'year']);
    });

    it('should call function from config', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents', aggregationsExpand: () => ['language'] } as any],
      });
      store.setCurrentType('documents');

      expect(store.aggregationsExpand()).toEqual(['language']);
    });

    it('should return empty array when not set', () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents' } as any],
      });
      store.setCurrentType('documents');

      expect(store.aggregationsExpand()).toEqual([]);
    });
  });

  describe('canAddRecord$()', () => {
    it('should return true by default', async () => {
      store.canAddRecord$().subscribe((status) => {
        expect(status.can).toBe(true);
      });
    });

    it('should use config canAdd function', async () => {
      store.updateRouteConfig({
        types: [{ key: 'documents', label: 'Documents', canAdd: () => of({ can: false, message: 'No add' }) } as any],
      });
      store.setCurrentType('documents');

      store.canAddRecord$().subscribe((status) => {
        expect(status.can).toBe(false);
        expect(status.message).toBe('No add');
      });
    });
  });

  describe('canUpdateRecord$()', () => {
    const mockRecord = { id: '1', metadata: {}, created: '', updated: '', links: { self: '' } };

    it('should return true by default', async () => {
      store.canUpdateRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(true);
      });
    });

    it('should use config canUpdate function', async () => {
      store.updateRouteConfig({
        types: [{ key: 'docs', label: 'Docs', canUpdate: () => of({ can: false, message: 'No update' }) } as any],
      });
      store.setCurrentType('docs');

      store.canUpdateRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(false);
        expect(status.message).toBe('No update');
      });
    });

    it('should use permissions when canUpdate is not set', async () => {
      store.updateRouteConfig({
        types: [
          {
            key: 'docs',
            label: 'Docs',
            canUpdate: undefined,
            permissions: () => of({ canUpdate: { can: true, message: 'via perms' } }),
          } as any,
        ],
      });
      store.setCurrentType('docs');

      store.canUpdateRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(true);
        expect(status.message).toBe('via perms');
      });
    });
  });

  describe('canDeleteRecord$()', () => {
    const mockRecord = { id: '1', metadata: {}, created: '', updated: '', links: { self: '' } };

    it('should return true by default', async () => {
      store.canDeleteRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(true);
      });
    });

    it('should use config canDelete function', async () => {
      store.updateRouteConfig({
        types: [{ key: 'docs', label: 'Docs', canDelete: () => of({ can: false, message: 'In use' }) } as any],
      });
      store.setCurrentType('docs');

      store.canDeleteRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(false);
      });
    });
  });

  describe('canReadRecord$()', () => {
    const mockRecord = { id: '1', metadata: {}, created: '', updated: '', links: { self: '' } };

    it('should return true by default', async () => {
      store.canReadRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(true);
      });
    });

    it('should use config canRead function', async () => {
      store.updateRouteConfig({
        types: [{ key: 'docs', label: 'Docs', canRead: () => of({ can: false, message: 'Restricted' }) } as any],
      });
      store.setCurrentType('docs');

      store.canReadRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(false);
      });
    });
  });

  describe('canUseRecord$()', () => {
    const mockRecord = { id: '1', metadata: {}, created: '', updated: '', links: { self: '' } };

    it('should return true by default from DEFAULT_RECORD_TYPE', async () => {
      store.canUseRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(true);
      });
    });

    it('should use config canUse function', async () => {
      store.updateRouteConfig({
        types: [{ key: 'docs', label: 'Docs', canUse: () => of({ can: false, message: 'No use' }) } as any],
      });
      store.setCurrentType('docs');

      store.canUseRecord$(mockRecord).subscribe((status) => {
        expect(status.can).toBe(false);
      });
    });
  });
});
