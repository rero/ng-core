/*
 * RERO angular core
 * Copyright (C) 2021 RERO
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
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormlyFieldTextArea } from '@ngx-formly/bootstrap';
import SimpleMDE from 'simplemde';

/**
 * Component to display textarea as a markdown editor.
 */
@Component({
  selector: 'ng-core-editor-formly-field-markdown',
  template: `
    <div class="my-2">
      <textarea #textarea></textarea>
      <div *ngIf="showError" class="invalid-feedback d-block">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
})
export class MarkdownFieldComponent extends FormlyFieldTextArea implements AfterViewInit {
  // Reference to textarea element.
  @ViewChild('textarea') textarea: ElementRef;

  /**
   * Markdown editor initialization and listen for changes to update the model
   * value.
   */
  ngAfterViewInit(): void {
    const simplemde = new SimpleMDE({
      spellChecker: false,
      promptURLs: true,
      initialValue: this.formControl.value,
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
      element: this.textarea.nativeElement,
      status: false,
    });

    simplemde.codemirror.on('change', () => {
      this.formControl.patchValue(simplemde.value());
    });
  }
}
