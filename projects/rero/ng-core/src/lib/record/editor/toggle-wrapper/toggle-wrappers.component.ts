import { Component, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { isEmpty, removeEmptyValues } from '../utils';

@Component({
  selector: 'ng-core-editor-formly-toggle-wrapper',
  template: `
    <div class='toggle-wrapper'>
      <div class="custom-control custom-switch">
        <input class="custom-control-input" type="checkbox" id="toggle-switch" (change)="toggle($event)" [checked]="tsOptions.enabled">
        <label class="custom-control-label" for="toggle-switch">{{ tsOptions.label }}</label>
      </div>
      <small class="form-text text-muted" *ngIf="tsOptions.description">{{ tsOptions.description }}</small>
      <ng-container *ngIf="tsOptions.enabled" #fieldComponent></ng-container>
    </div>
  `
})
export class ToggleWrapperComponent extends FieldWrapper implements OnInit {

  tsOptions = {
    label: 'Toggle',
    description: null,
    enabled: false
  };

  ngOnInit() {
    if (this.to['toggle-switch']) {
      this.tsOptions = {...this.tsOptions, ...this.to['toggle-switch']};
    }
    /* When wrapper is initialize, we should enable the toggle if the model already contains some data.
     * But, on init, the model isn't yet populated with data ; so we can't just check the model.
     * The least worst solution is to subscribe to `valueChanges` observable and check the model when we receive a response
     * Note: for a 'CustomField', it's better to implement `FormlyExtension` and use the `onPopulate` method
     */
    this.formControl.valueChanges.subscribe(
      () => this.tsOptions.enabled = !isEmpty(removeEmptyValues(this.model))
    );
  }

  toggle(event: any) {
    this.tsOptions.enabled = !this.tsOptions.enabled;
    if (this.tsOptions.enabled === false) {
      this.field.formControl.reset();  // reset all children fields
    }
  }

}
