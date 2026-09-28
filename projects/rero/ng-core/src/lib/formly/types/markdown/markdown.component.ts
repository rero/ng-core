// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AfterViewInit, Component, ElementRef, Type, viewChild } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';
import EasyMDE from 'easymde';
import { NgClass } from '@angular/common';
import { Textarea } from '@openng/optimus-ui/textarea';

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
  type: 'textarea' | Type<MarkdownFieldComponent>;
}

/**
 * Component to display textarea as a markdown editor.
 */
@Component({
  selector: 'ng-core-editor-formly-field-markdown',
  template: `
    <div style="padding-inline: 0; padding-block: 0" [ngClass]="{ 'p-inputtext ng-invalid ng-dirty': showError }">
      <textarea pTextarea #textarea></textarea>
    </div>
  `,
  imports: [NgClass, Textarea],
})
export class MarkdownFieldComponent extends FieldType<FieldTypeConfig<TextAreaProps>> implements AfterViewInit {
  // Reference to textarea element.
  readonly textarea = viewChild<ElementRef>('textarea');

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
      ],
    },
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
      element: this.textarea()?.nativeElement,
      status: this.props.status,
    });

    mde.codemirror.on('change', () => {
      this.formControl.patchValue(mde.value());
      this.formControl.markAsTouched();
    });
  }
}
