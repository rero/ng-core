/*
 * RERO angular core
 * Copyright (C) 2022-2024 RERO
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
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FieldType, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { GeneratePassword } from "js-generate-password";
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
  minLength: number;
  maxLength: number;
  specialChar: boolean;
  readonly: boolean;
  generateOptions: {
    length?: number;
    symbols?: boolean;
  };
  api?: string;
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
};

@Component({
  selector: 'ng-core-editor-field-password-generator',
  template: `
  <div>
    <div class="input-group mb-2 mr-sm-2">
      <input
        id="password"
        [type]="type"
        class="form-control"
        autocomplete="off"
        [formControl]="formControl"
        (change)="onChange($event.target.value)"
        [readonly]="props.readonly"
      >
      <div class="input-group-prepend">
        <div class="input-group-text" (click)="onClick()">
          <i class="fa fa-repeat" title="{{ 'Generate a new password' | translate }}"></i>
        </div>
        <div class="input-group-text" (click)="showHidePassword()">
          <i class="fa" [ngClass]="{'fa-eye': type === 'password', 'fa-eye-slash': type === 'text'}" title="{{ 'Show or hide password' | translate }}"></i>
        </div>
        @if (props.enabledEditMode) {
          <div class="input-group-text" (click)="props.readonly = !props.readonly">
            <i class="fa" [ngClass]="{'fa-lock': props.readonly, 'fa-unlock-alt': !props.readonly}" title="{{ 'Edit mode' | translate }}"></i>
          </div>
        }
      </div>
    </div>
    @if (!showError && hasBeenGenerated) {
      <small class="form-text text-muted" translate>
        The password has been copied to the clipboard.
      </small>
    }
  </div>
  `
})
export class PasswordGeneratorTypeComponent extends FieldType<FormlyFieldConfig<PasswordGeneratorProps>> implements OnInit {
  /** Default options */
  defaultOptions: Partial<FormlyFieldConfig<PasswordGeneratorProps>> = {
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
      generateOptions: {}
    }
  };

  hasBeenGenerated: boolean = false;

  /** Field password type (show or hide password) */
  type: 'text' | 'password' = 'password';

  /** Password Observable */
  private _password$: Subject<string> = new Subject();

  /**
   * Constructor
   * @param httpClient - HttpClient
   * @param clipboard - Clipboard
   * @param cd - ChangeDetectorRef
   */
  constructor(
    private httpClient: HttpClient,
    private clipboard: Clipboard,
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  /** OnInit hook */
  ngOnInit(): void {
    this._password$.pipe(
      tap((password: string) => this.clipboard.copy(this.formControl.errors ? ' ' : password)),
      tap((password: string) => this.formControl.setValue(password)),
    ).subscribe(() => {
      this.hasBeenGenerated = true;
      this.cd.markForCheck();
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
    this.type = this.type === 'password' ? 'text' : 'password';
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
    this.httpClient.get(this.props.api, {
      responseType: 'text',
      params: {
        length: this.props.minLength,
        special_char: this.props.specialChar
      }
    }).subscribe((password: string) => this._password$.next(password));
  }
}
