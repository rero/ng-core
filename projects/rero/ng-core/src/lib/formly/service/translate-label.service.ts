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
import { inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import type { ISelectOption } from "../types/select/select.component";

export type TranslatableOptionCollection =
  | ISelectOption[]
  | Record<string, ISelectOption>
  | null
  | undefined;

@Injectable({
  providedIn: 'root'
})
export class TranslateLabelService {

  private translateService: TranslateService = inject(TranslateService);

  translateLabel<T extends TranslatableOptionCollection>(options: T): T {
    if (Array.isArray(options)) {
      return options.map((option) => this.translateOption(option)) as T;
    }

    if (options && typeof options === 'object') {
      return Object.fromEntries(
        Object.entries(options).map(([key, value]) => [key, this.translateOption(value)])
      ) as T;
    }

    return options;
  }

  private translateOption(option: ISelectOption): ISelectOption {
    if (!option || typeof option !== 'object') {
      return option;
    }

    const untranslatedLabel =
      typeof option.untranslatedLabel === 'string'
        ? option.untranslatedLabel
        : typeof option.label === 'string'
          ? option.label
          : undefined;

    return {
      ...option,
      untranslatedLabel,
      label: untranslatedLabel ? this.translateService.instant(untranslatedLabel) : option.label,
      items: option.items ? this.translateLabel(option.items) : option.items,
      children: option.children ? this.translateLabel(option.children) : option.children,
    };
  }
}
