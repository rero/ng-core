// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Get human readable file size.
 */
@Pipe({ name: 'filesize' })
export class FilesizePipe implements PipeTransform {
  /**
   * Transform size to a human readable size.
   *
   * @param size Size of file.
   * @param precision Number of decimals.
   * @return Human readable file size.
   */
  transform(size: number, precision = 2): string {
    let i = -1;
    const byteUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
      size /= 1024;
      i++;
    } while (size > 1024);

    return [Math.max(size, 0.1).toFixed(precision), byteUnits[i]].join(' ');
  }
}
