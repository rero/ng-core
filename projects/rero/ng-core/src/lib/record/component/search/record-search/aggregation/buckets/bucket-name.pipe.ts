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
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { Bucket } from '../../../../../../model';

/**
 * Memoizes the Observable returned by processBucketName per bucket key.
 * Without this, each template re-render would create a new Observable,
 * causing the async pipe to re-subscribe and trigger a new HTTP call each time.
 */
@Pipe({ name: 'bucketName', pure: true, standalone: true })
export class BucketNamePipe implements PipeTransform {
  private readonly cache = new Map<string, Observable<string>>();
  private lastProcessFn: ((bucket: Bucket) => Observable<string>) | null = null;

  transform(bucket: Bucket, processFn: (bucket: Bucket) => Observable<string>): Observable<string> {
    if (processFn !== this.lastProcessFn) {
      this.cache.clear();
      this.lastProcessFn = processFn;
    }
    const key = `${bucket.aggregationKey ?? ''}:${bucket.key}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, processFn(bucket).pipe(shareReplay(1)));
    }
    return this.cache.get(key)!;
  }
}
