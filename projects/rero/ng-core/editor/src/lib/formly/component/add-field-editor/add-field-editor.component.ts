// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteSelectEvent } from '@openng/optimus-ui/autocomplete';
import { Listbox } from '@openng/optimus-ui/listbox';
import { SelectChangeEvent } from '@openng/optimus-ui/select';
import { JsonObject } from '@rero/ng-core';

import { EditorComponent } from '../../../editor/component/editor/editor.component';

/**
 * For big editor add the possibility to display
 */
@Component({
  selector: 'ng-core-editor-add-field-editor',
  templateUrl: './add-field-editor.component.html',
  imports: [AutoComplete, Listbox, TranslatePipe],
})
export class AddFieldEditorComponent<TMetadata extends JsonObject = JsonObject> implements OnInit {
  protected translateService: TranslateService = inject(TranslateService);
  private readonly injector = inject(Injector);
  private readonly onLangChange = toSignal(this.translateService.onLangChange, { initialValue: null });

  /** Instance of EditorComponent */
  readonly editorComponent = input.required<EditorComponent<TMetadata>>();

  items: WritableSignal<FormlyFieldConfig[]> = signal([]);

  suggestions: FormlyFieldConfig[] = [];

  private selectedField: FormlyFieldConfig | null = null;

  essentialsOptions = computed(() => (this.items() ?? []).filter((f) => this.isFieldEssential(f)));

  readonly autocomplete = viewChild<AutoComplete>('addField');

  onAddField(event: SelectChangeEvent): void {
    this.editorComponent().setHide(event.value, false, true);
  }

  /** onInit hook */
  ngOnInit(): void {
    effect(
      () => {
        this.onLangChange();
        this.fieldsTranslate(this.editorComponent().hiddenFields());
      },
      { injector: this.injector },
    );
  }

  search(event: AutoCompleteCompleteEvent): void {
    this.suggestions = this.items().filter((item) => {
      return (item.props?.label ?? '').toLowerCase().indexOf(event.query.toLowerCase()) > -1;
    });
  }

  onSelect(event: AutoCompleteSelectEvent): void {
    this.selectedField = event.value;
    this.autocomplete()?.clear();
  }

  onAutocompleteHide(): void {
    if (this.selectedField === null) {
      return;
    }

    const field = this.selectedField;
    this.selectedField = null;
    this.editorComponent().setHide(field, false, true);
  }

  /**
   * Filter fields to display only essential ones
   * @param field - field to check
   */
  isFieldEssential(field: FormlyFieldConfig) {
    return field.props?.navigation && field.props.navigation.essential === true;
  }

  fieldsTranslate(fields: FormlyFieldConfig[]) {
    this.items.set(
      fields
        .map((field) => {
          if (field.props?.label) {
            field.props.label = this.translateService.instant(field.props.untranslatedLabel);
          }
          return field;
        })
        .sort(
          (field1: FormlyFieldConfig, field2: FormlyFieldConfig) =>
            field1.props?.label?.localeCompare(field2.props?.label || '') || 0,
        ),
    );
  }
}
