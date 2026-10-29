// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Service } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { RecordService, resolveRefs } from '@rero/ng-core';
import { Observable, of } from 'rxjs';

/**
 * Check the uniqueness of a form field value among the records.
 */
@Service()
export class UniqueValueService {
  protected recordService: RecordService = inject(RecordService);

  /**
   * Check if a record is already registered with the same value
   * @param field - FormlyFieldConfig, field to check
   * @param recordType - string, type of record
   * @param excludePid - string, PID to ignore (normally the current record we are checking)
   * @param term - string, the elasticsearch term to check the uniqueness, use field.key if not given
   * @param limitToValues - string[], limit the test to a given list of values
   * @param filter - string, additional es query filters
   */
  uniqueValue(
    field: FormlyFieldConfig,
    recordType: string,
    excludePid?: string,
    term?: string,
    limitToValues?: string[],
    filter?: string,
  ): Observable<ValidationErrors | boolean | null> {
    let key = field.key;
    if (term != null) {
      key = term;
    }
    const value = field?.formControl?.value;
    if (value == null) {
      return of(true);
    }
    if (limitToValues && limitToValues.length > 0 && !limitToValues.some((v) => v === value)) {
      return of(true);
    }
    const filterQuery = filter != null ? Function('model', `return ${filter};`)(resolveRefs(field.model)) : undefined;
    return this.recordService.valueAlreadyExists(recordType, String(key), value, excludePid, filterQuery);
  }
}
