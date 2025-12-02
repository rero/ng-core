/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
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
import { Clipboard } from '@angular/cdk/clipboard';
import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { GeneratePassword } from 'generate-password-lite';
import { Button } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Available options for generateOptions (GeneratePassword):
 * - length: Integer, length of password.
 *   default: 10
 * - lowercase: Boolean, put lowercase letters in password.
 *   default: true
 * - uppercase: Boolean, put uppercase letters in password.
 *   default: true
 * - numbers: Boolean, put numbers in password.
 *   default: true
 * - symbols: Boolean, put symbols in password.
 *   default: false
 * - exclude: String, characters to be excluded from password.
 *   default: ''
 * - minLengthLowercase: only if lowercase is set to true, minLengthLowercase will create
 *   a password that will have minimum number of lower case characters in the password.
 *   default: 1
 * - minLengthUppercase: only if uppercase is set to true, minLengthUppercase will create
 *   a password that will have minimum number of upper case characters in the password.
 *   default: 1
 * - minLengthNumbers: only if numbers is set to true, minLengthNumbers will create
 *   a password that will have minimum number of numbers in the password.
 *   default: 1
 * - minLengthSymbols: only if symbols is set to true, minLengthSymbols will create
 *   a password that will have minimum number of symbols in the password.
 *   default: 1
 */

interface PasswordGeneratorProps extends FormlyFieldProps {
  enabledEditMode: boolean;
  class?: string;
  minLength: number;
  maxLength: number;
  specialChar: boolean;
  readonly: boolean;
  generateOptions: {
    length?: number;
    symbols?: boolean;
  };
  api: string;
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  exclude?: string;
  minLengthLowercase?: number;
  minLengthUppercase?: number;
  minLengthNumbers?: number;
  minLengthSymbols?: number;
}

@Component({
  selector: 'ng-core-editor-field-password-generator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    p-inputGroupAddon {
      padding: 0 !important;
    }
  `,
  template: `
    <p-inputGroup>
      <input
        pInputText
        #password
        id="password"
        [type]="type()"
        autocomplete="off"
        [formControl]="formControl"
        (change)="onChange($event.target.value)"
        [readonly]="readonly()"
        [class]="props.class ? props.class : readonly() ? 'core:!bg-surface-200' : ''"
        [ngClass]="{ 'ng-invalid ng-dirty': showError }"
      />
      <p-inputGroupAddon class="core:flex">
        <p-button
          icon="fa fa-repeat"
          [title]="'Generate a new password' | translate"
          (click)="onClick()"
          severity="secondary"
          variant="text"
        />
      </p-inputGroupAddon>
      <p-inputGroupAddon>
        <p-button
          [icon]="type() === 'text' ? 'fa fa-eye-slash' : 'fa fa-eye'"
          [title]="'Show or hide password' | translate"
          (click)="showHidePassword()"
          severity="secondary"
          variant="text"
        />
      </p-inputGroupAddon>
      @if (props.enabledEditMode) {
        <p-inputGroupAddon>
          <p-button
            [icon]="readonly() ? 'fa fa-lock' : 'fa fa-unlock-alt'"
            [title]="'Edit mode' | translate"
            (click)="onEdit()"
            severity="secondary"
            variant="text"
          />
        </p-inputGroupAddon>
      }
    </p-inputGroup>
    @if (!showError && hasBeenGenerated()) {
      <div class="core:text-muted-color core:my-4" translate>The password has been copied to the clipboard.</div>
    }
  `,
  imports: [
    InputGroup,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    NgClass,
    InputGroupAddon,
    TranslateDirective,
    TranslatePipe,
    Button,
  ],
})
export class PasswordGeneratorComponent extends FieldType<FieldTypeConfig<PasswordGeneratorProps>> implements OnInit {
  protected httpClient: HttpClient = inject(HttpClient);
  protected clipboard: Clipboard = inject(Clipboard);
  private readonly destroyRef = inject(DestroyRef);

  passwordField: Signal<ElementRef | undefined> = viewChild('password');

  /** Default options */
  defaultOptions: Partial<FieldTypeConfig<PasswordGeneratorProps>> = {
    props: {
      // Allows you to edit the password
      enabledEditMode: false,
      // Minimum password size
      minLength: 8,
      // Maximum password size
      maxLength: 255,
      // Password generation with special characters (ex: $%&)
      specialChar: false,
      // The field is readonly
      readonly: true,
      // If you use the function in javascript, it is possible
      // to pass options. See the information above.
      generateOptions: {},
      api: '',
    },
  };

  readonly hasBeenGenerated = signal(false);

  /** Field password type (show or hide password) */
  readonly type = signal<'text' | 'password'>('password');

  /** Tracks props.readonly reactively — mutated directly in onEdit(), not via Formly expressions */
  readonly readonly = signal(true);

  /** Password Observable */
  private _password$ = new Subject<string>();

  /** OnInit hook */
  ngOnInit(): void {
    this.readonly.set(this.props.readonly);
    this._password$
      .pipe(
        tap((password: string) => this.formControl.setValue(password)),
        tap((password: string) => this.clipboard.copy(this.formControl.errors ? ' ' : password)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.hasBeenGenerated.set(true);
      });
  }

  /** Generation of the password when the button is clicked. */
  onClick(): void {
    if (!this.props.api) {
      this._jsGeneration();
    } else {
      this._callApi();
    }
  }

  /**
   * Change the password when entering.
   * @param password - string
   */
  onChange(password: string): void {
    this._password$.next(password);
  }

  /** Hide or show password data */
  showHidePassword(): void {
    this.type.set(this.type() === 'password' ? 'text' : 'password');
  }

  onEdit(): void {
    const newValue = !this.readonly();
    this.props.readonly = newValue;
    this.readonly.set(newValue);
    if (!newValue) {
      this.passwordField()?.nativeElement.focus();
    }
  }

  /** Generate the password by javascript */
  private _jsGeneration(): void {
    if (!this.props.generateOptions.length) {
      this.props.generateOptions.length = this.props.minLength;
    }
    if (!this.props.generateOptions.symbols) {
      this.props.generateOptions.symbols = this.props.specialChar;
    }
    this._password$.next(GeneratePassword(this.props.generateOptions));
  }

  /** Call backend api entrypoint */
  private _callApi(): void {
    if (!this.props.api) {
      this.httpClient
        .get(this.props.api, {
          responseType: 'text',
          params: {
            length: this.props.minLength,
            special_char: this.props.specialChar,
          },
        })
        .subscribe((password: string) => this._password$.next(password));
    }
  }
}
