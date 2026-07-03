// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Error } from './error.interface';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Component for displaying errors.
 */
@Component({
  selector: 'ng-core-error',
  template: `
    <div class="core:text-center core:my-8">
      <p class="core:text-4xl">
        <i class="fa-solid fa-bolt core:mr-4"></i>
        <span class="core:text-muted-color">{{ error().status }}</span>
        {{ error().title }}
      </p>
      <h5 class="core:mt-8">{{ error().message || ('You cannot access this page.' | translate) }}</h5>
    </div>
  `,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  // Error object containing title, status and optionally a message.
  readonly error = input.required<Error>();
}
