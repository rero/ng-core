/*
 * RERO angular core
 * Copyright (C) 2020-2024 RERO
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
import { ChangeDetectionStrategy, Component, inject, effect, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { paramMapToSearchParams, searchParamsToUrlParams, shallowEqual } from '../../record-search-utils';
import { RecordSearchStore } from './store/record-search.store';
import { RecordUiService } from '../../service/record-ui/record-ui.service';
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
  private readonly recordUiService = inject(RecordUiService);

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

    // Legacy service update (Targeted for future refactoring)
    if (this.route.snapshot.data?.['types']) {
      this.recordUiService.types = this.route.snapshot.data['types'];
    }

    /**
     * C. Sync Store -> URL (Output Effect)
     * Reacts whenever the store state changes to update the browser URL.
     */
    effect(() => {
      const currentType = this.store.currentType();
      // Read individual signals so the effect tracks only the URL-relevant fields
      const storeParams: Partial<SearchParams> = {
        q: this.store.q(),
        page: this.store.page(),
        size: this.store.size(),
        sort: this.store.sort(),
        aggregationsFilters: this.store.aggregationsFilters(),
        searchFields: [],
        searchFilters: [],
      };

      // We use untracked to read current route state without creating dependencies,
      // preventing recursive effect triggers.
      untracked(() => {
        const urlParams = paramMapToSearchParams(this.route.snapshot.queryParamMap);
        const currentTypeInUrl = this.route.snapshot.paramMap.get('type');

        const paramsInSync = shallowEqual(storeParams, urlParams);
        const typeInSync = currentType === currentTypeInUrl;

        if (!paramsInSync || !typeInSync) {
          this.navigate(currentType, storeParams as SearchParams);
        }
      });
    });
  }

  /**
   * Helper method to perform the actual router navigation
   */
  private navigate(currentType: string, params: SearchParams) {
    this.router.navigate(['..', currentType], {
      relativeTo: this.route,
      queryParams: searchParamsToUrlParams(params, this.store.aggregationsFilters()),
      replaceUrl: true, // Prevents polluting browser history with every filter change
    });
  }
}
