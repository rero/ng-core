/*
 * RERO angular core
 * Copyright (C) 2020 RERO
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
import { Component, Input, OnInit } from '@angular/core';

/**
 * Component for displaying a "read more" link after a text.
 */
@Component({
    selector: 'ng-core-text-read-more',
    templateUrl: './text-read-more.component.html',
    standalone: false
})
export class TextReadMoreComponent implements OnInit {
  /** Initial text  */
  @Input() text: string;

  /** Number of parts to display (depending of the unit)  */
  @Input() limit = 50;

  /** "Show more" label to display */
  @Input() showMoreLabel = 'Show more';

  /** "Show less" label to display  */
  @Input() showLessLabel = 'Show less';

  /** Splitting unit [ word | character] */
  @Input() unit = 'word';

  /** trailing string */
  @Input() trailing = '…';

  /** The text that will be display */
  textToDisplay: string;

  /** boolean to know if initial text is expanded  */
  isExpanded = false;

  /** boolean to know if limit is reached */
  isLimitReached = true;

  /** The truncated text  */
  private sTruncateText: string;

  ngOnInit() {
    this.textToDisplay = this.sTruncateText = this._truncateText();
    if (this.text === this.textToDisplay) {
      this.isLimitReached = false;
    }
  }

  /**
   * Allow to toggle content of the field
   * @param event : Click event
   */
  toggleText(event: Event) {
    event.preventDefault();
    this.textToDisplay = (this.isExpanded)
      ? this.sTruncateText
      : this.text;
    this.isExpanded = !this.isExpanded;
  }

  /**
   * Show the link label depending of isExpanded
   */
  get linkLabel(): string {
    return this.isExpanded ? this.showLessLabel : this.showMoreLabel;
  }

  /**
   * Truncate initial text using the defined limit and unit.
   */
  private _truncateText(): string {
    if (this.text === undefined) {
       return '';
    }
    let pattern: any = /\s+/;
    let joinText = ' ';
    if (this.unit !== 'word') {
      pattern = '';
      joinText = '';
    }
    const parts = this.text.split(pattern);

    if (parts.length <= this.limit) {
      return this.text;
    } else {
      if (this.limit < 0) {
        const tmpLimit = this.limit * -1;
        return this.trailing + parts.slice(parts.length - tmpLimit, parts.length).join(joinText);
      } else {
        return parts.slice(0, this.limit).join(joinText) + this.trailing;
      }
    }
  }
}


