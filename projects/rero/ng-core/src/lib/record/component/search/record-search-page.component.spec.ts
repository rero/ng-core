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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { RecordUiService } from '../../service/record-ui/record-ui.service';
import { RecordService } from '../../service/record/record.service';
import { RecordSearchPageComponent } from './record-search-page.component';
import { RecordSearchStore } from './store/record-search.store';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

describe('RecordSearchPageComponent', () => {
  let component: RecordSearchPageComponent;
  let fixture: ComponentFixture<RecordSearchPageComponent>;
  let mockRouter: any;
  let mockRecordUiService: any;
  let mockRecordService: any;
  let queryParamMapSubject: BehaviorSubject<ParamMap>;
  let paramMapSubject: BehaviorSubject<ParamMap>;
  let mockActivatedRoute: any;

  // No logs needed for tests

  beforeEach(async () => {
    queryParamMapSubject = new BehaviorSubject<ParamMap>({
      has: (_: string) => false,
      get: (_: string) => null,
      getAll: (_: string) => [],
      keys: [],
    } as ParamMap);

    paramMapSubject = new BehaviorSubject<ParamMap>({
      has: (key: string) => key === 'type',
      get: (key: string) => (key === 'type' ? 'documents' : null),
      getAll: (_: string) => [],
      keys: ['type'],
    } as ParamMap);

    mockRouter = {
      navigate: vi.fn(),
      createUrlTree: vi.fn(),
      serializeUrl: vi.fn(),
    };
    mockRouter.createUrlTree.mockReturnValue({} as any);
    mockRouter.serializeUrl.mockReturnValue('/search/documents');

    const dataMock = {
      types: [{ key: 'documents', label: 'Documents' } as any],
    };

    mockRecordUiService = {
      types: [],
    } as any;

    mockRecordService = {
      getRecords: vi.fn(),
    };

    mockActivatedRoute = {
      queryParamMap: queryParamMapSubject.asObservable(),
      paramMap: paramMapSubject.asObservable(),
      data: new BehaviorSubject(dataMock).asObservable(),
      snapshot: {
        queryParamMap: queryParamMapSubject.value,
        paramMap: paramMapSubject.value,
        params: { type: 'documents' },
        data: dataMock,
      },
    };

    await TestBed.configureTestingModule({
      imports: [RecordSearchPageComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: RecordUiService, useValue: mockRecordUiService },
        { provide: RecordService, useValue: mockRecordService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordSearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should inject the store', () => {
      expect(component.store).toBeTruthy();
      expect(component.store).toBeInstanceOf(RecordSearchStore);
    });

    it('should have route and router injected', () => {
      expect((component as any).route).toBeTruthy();
      expect((component as any).router).toBeTruthy();
    });

    it('should have recordUiService injected', () => {
      expect((component as any).recordUiService).toBeTruthy();
    });
  });

  describe('Route Parameter Extraction', () => {
    it('should update store when type changes in route params', async () => {
      const updateCurrentTypeSpy = vi.spyOn(component.store, 'updateCurrentType');

      // Setup initial config with multiple types
      component.store.updateRouteConfig({
        types: [
          { key: 'documents', label: 'Documents', sortOptions: [] } as any,
          { key: 'books', label: 'Books', sortOptions: [] } as any,
        ],
      });

      paramMapSubject.next({
        has: (key: string) => key === 'type',
        get: (key: string) => (key === 'type' ? 'books' : null),
        getAll: (_: string) => [],
        keys: ['type'],
      } as ParamMap);

      mockActivatedRoute.snapshot.paramMap = paramMapSubject.value;
      mockActivatedRoute.snapshot.params = { type: 'books' };

      await new Promise((resolve) => setTimeout(resolve, 200));
      fixture.detectChanges();
      expect(updateCurrentTypeSpy).toHaveBeenCalledWith('books');
    });

    it('should use default type when route param is missing', async () => {
      paramMapSubject.next({
        has: (_: string) => false,
        get: (_: string) => null,
        getAll: (_: string) => [],
        keys: [],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 200));
      fixture.detectChanges();
      // Default type should be set in store
      expect(component.store.currentType()).toBeDefined();
    });

    it('should update store with search parameters from URL query params', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'q' || key === 'page',
        get: (key: string) => {
          if (key === 'q') return 'test query';
          if (key === 'page') return '2';
          return null;
        },
        getAll: (key: string) => {
          if (key === 'q') return ['test query'];
          if (key === 'page') return ['2'];
          return [];
        },
        keys: ['q', 'page'],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 200));
      fixture.detectChanges();
      // Verify store was updated
      expect(component.store.q()).toBe('test query');
      expect(component.store.page()).toBe(2);
    });
  });

  describe('Route Configuration', () => {
    it('should update store with route configuration data', () => {
      expect(component.store.routeConfig()).toEqual(
        expect.objectContaining({
          types: expect.arrayContaining([expect.objectContaining({ key: 'documents', label: 'Documents' })]),
        }),
      );
    });

    it('should update recordUiService types from route data', async () => {
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 100));
      fixture.detectChanges();
      expect(mockRecordUiService.types).toEqual([{ key: 'documents', label: 'Documents' } as any]);
    });

    it('should handle missing route data gracefully', () => {
      const originalData = mockActivatedRoute.snapshot.data;
      mockActivatedRoute.snapshot.data = {};
      const newFixture = TestBed.createComponent(RecordSearchPageComponent);
      const newComponent = newFixture.componentInstance;

      expect(() => newFixture.detectChanges()).not.toThrow();
      expect(newComponent).toBeTruthy();

      // Restore original data
      mockActivatedRoute.snapshot.data = originalData;
    });
  });

  describe('URL to Store Synchronization', () => {
    it('should update store when URL parameters change', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'q',
        get: (key: string) => (key === 'q' ? 'new search' : null),
        getAll: (key: string) => (key === 'q' ? ['new search'] : []),
        keys: ['q'],
      } as ParamMap);

      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(component.store.q()).toBe('new search');
    });

    it('should handle page parameter changes from URL', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'page',
        get: (key: string) => (key === 'page' ? '5' : null),
        getAll: (key: string) => (key === 'page' ? ['5'] : []),
        keys: ['page'],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 100));
      fixture.detectChanges();
      expect(component.store.page()).toBe(5);
    });

    it('should handle size parameter changes from URL', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'size',
        get: (key: string) => (key === 'size' ? '50' : null),
        getAll: (key: string) => (key === 'size' ? ['50'] : []),
        keys: ['size'],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 100));
      fixture.detectChanges();
      expect(component.store.size()).toBe(50);
    });

    it('should handle sort parameter changes from URL', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'sort',
        get: (key: string) => (key === 'sort' ? 'title' : null),
        getAll: (key: string) => (key === 'sort' ? ['title'] : []),
        keys: ['sort'],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 100));
      fixture.detectChanges();
      expect(component.store.sort()).toBe('title');
    });
  });

  describe('Store to URL Synchronization', () => {
    it('should navigate when store parameters change', async () => {
      component.store.updateQuery('test search');

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should not navigate if store params match URL params', async () => {
      // Set URL params to match store
      queryParamMapSubject.next({
        has: (key: string) => key === 'q',
        get: (key: string) => (key === 'q' ? 'same search' : null),
        getAll: (_: string) => [],
        keys: ['q'],
      } as ParamMap);
      mockActivatedRoute.snapshot.queryParamMap = queryParamMapSubject.value;

      await new Promise((resolve) => setTimeout(resolve, 50));
      mockRouter.navigate.mockClear();

      component.store.updateQuery('same search');
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Navigation should not have been called again
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should use replaceUrl when navigating', async () => {
      component.store.updatePage(3);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          replaceUrl: true,
        }),
      );
    });

    it('should include queryParams when navigating', async () => {
      component.store.updateSize(25);

      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          queryParams: expect.any(Object),
          replaceUrl: true,
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid URL changes without errors', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'q',
        get: (_: string) => 'search 1',
        getAll: (_: string) => [],
        keys: ['q'],
      } as ParamMap);

      queryParamMapSubject.next({
        has: (key: string) => key === 'q',
        get: (_: string) => 'search 2',
        getAll: (_: string) => [],
        keys: ['q'],
      } as ParamMap);

      queryParamMapSubject.next({
        has: (key: string) => key === 'q',
        get: (_: string) => 'search 3',
        getAll: (_: string) => [],
        keys: ['q'],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 150));
      fixture.detectChanges();
      expect(component.store.q()).toBe('search 3');
    });

    it('should handle rapid store changes without errors', async () => {
      component.store.updateQuery('query 1');
      component.store.updateQuery('query 2');
      component.store.updateQuery('query 3');

      await new Promise((resolve) => setTimeout(resolve, 150));
      fixture.detectChanges();
      expect(component.store.q()).toBe('query 3');
    });

    it('should handle missing route parameters gracefully', async () => {
      paramMapSubject.next({
        has: (_: string) => false,
        get: (_: string) => null,
        getAll: (_: string) => [],
        keys: [],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 200));
      fixture.detectChanges();
      // Store should still have valid state
      expect(component.store.q()).toBeDefined();
      expect(component.store.currentType()).toBeDefined();
    });

    it('should handle invalid page numbers in URL', async () => {
      queryParamMapSubject.next({
        has: (key: string) => key === 'page',
        get: (key: string) => (key === 'page' ? 'invalid' : null),
        getAll: (_: string) => [],
        keys: ['page'],
      } as ParamMap);

      await new Promise((resolve) => setTimeout(resolve, 200));
      fixture.detectChanges();
      // Should handle gracefully - the paramMapToSearchParams function should handle this
      expect(component.store.q()).toBeDefined();
    });
  });
});
