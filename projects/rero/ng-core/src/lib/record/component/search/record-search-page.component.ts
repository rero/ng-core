// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, inject, effect, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { paramMapToSearchParams, searchParamsToUrlParams, shallowEqual } from '../../record-search-utils';
import { RecordSearchStore } from './store/record-search.store';
import { RecordSearchComponent } from './record-search/record-search.component';
import { SearchParams } from '../../model';

@Component({
  selector: 'ng-core-record-search-page',
  standalone: true,
  templateUrl: './record-search-page.component.html',
  imports: [RecordSearchComponent],
  providers: [RecordSearchStore], // Store is scoped to this page component
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordSearchPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly store = inject(RecordSearchStore);

  constructor() {
    /**
     * A1. Sync URL path param :type -> currentType (via updateCurrentType)
     */
    this.route.paramMap
      .pipe(
        map((p) => p.get('type') || ''),
        takeUntilDestroyed(),
      )
      .subscribe((type) => {
        if (type) {
          this.store.updateCurrentType(type);
        }
      });
    /**
     * A2. Sync URL query params -> searchParams (via syncUrlParams rxMethod)
     */
    this.store.syncUrlParams(this.route.queryParamMap.pipe(map((paramMap) => paramMapToSearchParams(paramMap))));

    /**
     * B. Sync Route Data (Static or Resolved data)
     */
    this.store.updateRouteConfig(this.route.snapshot.data);

    /**
     * C. Sync Store -> URL (Output Effect)
     * Reacts whenever the store state changes to update the browser URL.
     */
    effect(() => {
      const currentType = this.store.currentType();
      // Read individual signals so the effect tracks only the URL-relevant fields
      // `activeSort` is used instead of `sort`, so the default sort defined in the
      // configuration is materialized in the URL instead of an empty `sort` parameter.
      const activeSort = this.store.activeSort();
      const storeParams: Partial<SearchParams> = {
        q: this.store.q(),
        page: this.store.page(),
        size: this.store.size(),
        aggregationsFilters: this.store.aggregationsFilters(),
      };
      // No sort option is available for this type: keep the parameter out of the URL.
      if (activeSort) {
        storeParams.sort = activeSort;
      }

      // We use untracked to read current route state without creating dependencies,
      // preventing recursive effect triggers.
      untracked(() => {
        const urlParams = paramMapToSearchParams(this.route.snapshot.queryParamMap);
        const currentTypeInUrl = this.route.snapshot.paramMap.get('type');

        const paramsInSync = shallowEqual(storeParams, urlParams);
        const typeInSync = currentType === currentTypeInUrl;

        if (!paramsInSync || !typeInSync) {
          this.navigate(currentType, storeParams);
        }
      });
    });
  }

  /**
   * Helper method to perform the actual router navigation
   */
  private navigate(currentType: string, params: Partial<SearchParams>) {
    this.router.navigate(['..', currentType], {
      relativeTo: this.route,
      queryParams: searchParamsToUrlParams(params, this.store.aggregationsFilters()),
      replaceUrl: true, // Prevents polluting browser history with every filter change
    });
  }
}
