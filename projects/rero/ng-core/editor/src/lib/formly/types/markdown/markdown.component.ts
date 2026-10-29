// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { NgClass } from '@angular/common';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, Type, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyFieldConfig, FormlyFieldProps } from '@ngx-formly/core';
import { Textarea } from '@openng/optimus-ui/textarea';
// Type-only import: erased at compile time, so it does not load CodeMirror on the server.
import type EasyMDE from 'easymde';

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
      <textarea pTextarea #textarea [formControl]="formControl"></textarea>
    </div>
  `,
  imports: [NgClass, ReactiveFormsModule, Textarea],
})
export class MarkdownFieldComponent extends FieldType<FieldTypeConfig<TextAreaProps>> {
  // Reference to textarea element.
  readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  private editor?: EasyMDE;
  private destroyed = false;

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

  constructor() {
    super();
    // Browser only: EasyMDE (CodeMirror) needs the DOM as soon as it is loaded,
    // so it is imported lazily once the view is rendered.
    afterNextRender(() => this.initEditor());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.editor?.cleanup();
    });
  }

  /**
   * Markdown editor initialization and listen for changes to update the model
   * value.
   */
  private initEditor(): void {
    import('easymde')
      .then(({ default: EasyMDE }) => {
        if (this.destroyed) {
          return;
        }
        const editor = new EasyMDE({
          spellChecker: this.props.spellChecker,
          promptURLs: this.props.promptURLs,
          initialValue: this.formControl.value,
          maxHeight: this.props.maxHeight,
          minHeight: this.props.minHeight,
          toolbar: this.props.toolbar,
          element: this.textarea().nativeElement,
          status: this.props.status,
        });
        editor.codemirror.on('change', () => {
          this.formControl.patchValue(editor.value());
          this.formControl.markAsTouched();
        });
        this.editor = editor;
      })
      // The textarea, bound to the form control, remains usable as a fallback.
      .catch((error) => console.error('[MarkdownFieldComponent] EasyMDE loading failed', error));
  }
}
