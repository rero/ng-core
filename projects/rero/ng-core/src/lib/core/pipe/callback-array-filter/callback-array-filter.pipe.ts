// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe for applying a callback function to filter array items.
 */
@Pipe({ name: 'callbackArrayFilter' })
export class CallbackArrayFilterPipe implements PipeTransform {
  /**
   * Filter array items with the given callback function.
   *
   * @param items List of items.
   * @param callback Callback function to apply.
   * @return List of filtered values.
   */
  transform<T>(items: T[], callback?: (item: T) => boolean): T[] {
    if (items?.length) {
      if (!callback) {
        return items;
      } else {
        return items.filter((item) => callback(item));
      }
    }
    return [];
  }
}
