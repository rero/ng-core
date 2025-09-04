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
import { Component, computed, input, linkedSignal } from '@angular/core';
import { _ } from '@ngx-translate/core';

@Component({
  selector: 'ng-core-read-more',
  template: `
    @if(katex()) {
      <span katex [innerHTML]="textDisplay() | nl2br"></span>
    } @else {
      <span [innerHTML]="textDisplay() | nl2br"></span>
    }

    @if(showMoreActivated()) {
      &nbsp;<a class="core:font-bold" href="#" (click)="toggleText($event)">{{ showMoreLinkLabel() | translate }}</a>
    }
  `,
  standalone: false
})
export class ReadMoreComponent {

  text = input.required<string>();
  limit = input<number>(50);
  unit = input<'char'|'word'>('word');
  trailing = input<string>('…');
  showMoreLabel = input<string>(_('show more'));
  showLessLabel = input<string>(_('show less'));
  katex = input<boolean>(false);

  showMore = linkedSignal(() => this.showMoreActivated());

  textDisplay = computed(() => this.processText(this.originalText(), this.showMore()));
  showMoreLinkLabel = computed(() => this.showMore() ? this.showMoreLabel() : this.showLessLabel());
  showMoreActivated = computed(() => this.countElement() > this.limit());

  private originalText = computed(() => this.text().replace(/<.*?>/g, ''));

  toggleText(event: Event): void {
    event.preventDefault();
    this.showMore.set(!this.showMore());
  }

  private countElement(): number {
    return (this.unit() === 'word') ? this.splitWord().length : this.originalText().length;
  }

  private processText(data: string, more: boolean): string {
    if (more) {
      let result: string[] = [];
      if (this.unit() === 'word') {
        result = this.splitWord().slice(0, this.limit());
      } else {
        result.push(data.slice(0, this.limit()));
      }
      result.push(this.trailing());
      return result.join(' ');
    } else {
      return data;
    }
  }

  private splitWord(): string[] {
    return this.originalText().split(/\s+/);
  }
}
