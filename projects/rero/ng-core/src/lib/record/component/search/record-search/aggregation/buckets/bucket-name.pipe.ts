// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
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
