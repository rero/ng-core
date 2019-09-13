import { Component, OnInit, Input } from '@angular/core';
import { ResultItem } from '@rero/ng-core';

@Component({
  templateUrl: './document.component.html'
})
export class DocumentComponent implements ResultItem {
  @Input()
  record: object;

  @Input()
  type: string;
}
