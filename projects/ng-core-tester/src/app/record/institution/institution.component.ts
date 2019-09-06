import { Component, OnInit, Input } from '@angular/core';
import { ResultItem } from '@rero/ng-core';

@Component({
  templateUrl: './institution.component.html'
})
export class InstitutionComponent implements ResultItem {
  @Input() record: object;
}
