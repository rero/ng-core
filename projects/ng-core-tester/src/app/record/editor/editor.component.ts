// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { AfterContentChecked, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EditorComponent as CoreEditorComponent, JsonValue } from '@rero/ng-core';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  imports: [Card, CoreEditorComponent],
})
export class EditorComponent implements OnInit, AfterContentChecked {
  // Inject
  private route = inject(ActivatedRoute);

  /* form initial values */
  model: JsonValue | null = {};

  /* Model to display on the top of the form */
  modelDisplay = {};

  /** Edit or New mode */
  mode: 'Edit' | 'New' = 'New';

  /** OnInit hook */
  ngOnInit(): void {
    this.mode = 'pid' in this.route.snapshot.params ? 'Edit' : 'New';
  }

  /** after content checked hook */
  ngAfterContentChecked(): void {
    this.modelDisplay = JSON.stringify(this.model, null, 2);
  }

  /** Callback when the model values has changed.
   * @param value - object the new model values
   */
  modelChanged(value: JsonValue | null): void {
    this.model = value;
  }
}
