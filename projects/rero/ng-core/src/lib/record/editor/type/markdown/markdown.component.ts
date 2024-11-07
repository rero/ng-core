/*
 * RERO angular core
 * Copyright (C) 2021-2024 RERO
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
import { AfterViewInit, Component, ElementRef, Type, ViewChild } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldProps } from '@ngx-formly/primeng/form-field';
import { FormlyFieldTextArea } from '@ngx-formly/primeng/textarea';
import EasyMDE from 'easymde';

interface TextAreaProps extends FormlyFieldProps {
  maxHeight?: string;
  minHeight: string;
  placeholder?: string;
  promptURLs: boolean;
  spellChecker: boolean;
  status: boolean;
  toolbar: any[];
}

export interface FormlyTextAreaFieldConfig extends FormlyFieldConfig<TextAreaProps> {
  type: 'textarea' | Type<FormlyFieldTextArea>;
}

/**
 * Component to display textarea as a markdown editor.
 */
@Component({
  selector: 'ng-core-editor-formly-field-markdown',
  template: `
    <div class="my-2">
      <textarea #textarea></textarea>
      @if (showError) {
        <div class="text-error my-2">
          <formly-validation-message [field]="field"/>
        </div>
      }
    </div>
  `,
})
export class MarkdownFieldComponent extends FieldType<FieldTypeConfig<TextAreaProps>> implements AfterViewInit {
  // Reference to textarea element.
  @ViewChild('textarea') textarea: ElementRef;

  /** Default options */
  defaultOptions?: Partial<FieldTypeConfig<TextAreaProps>> = {
    props: {
      minHeight: '500px',
      promptURLs: true,
      spellChecker: false,
      status: false,
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'image',
        '|',
        'preview',
        'fullscreen',
        '|',
        'guide',
      ]
    }
  };

  /**
   * Markdown editor initialization and listen for changes to update the model
   * value.
   */
  ngAfterViewInit(): void {
    const mde = new EasyMDE({
      spellChecker: this.props.spellChecker,
      promptURLs: this.props.promptURLs,
      initialValue: this.formControl.value,
      maxHeight: this.props.maxHeight,
      minHeight: this.props.minHeight,
      toolbar: this.props.toolbar,
      element: this.textarea.nativeElement,
      status: this.props.status,
    });

    mde.codemirror.on('change', () => {
      this.formControl.patchValue(mde.value());
    });
  }
}
