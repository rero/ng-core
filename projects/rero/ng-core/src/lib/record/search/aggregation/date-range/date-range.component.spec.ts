/*
 * RERO angular core
 * Copyright (C) 2022-2025 RERO
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
import { CommonModule } from "@angular/common";
import { ComponentRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DatePickerModule } from "primeng/datepicker";
import { RecordSearchService } from "../../record-search.service";
import { AggregationDateRangeComponent } from "./date-range.component";
import { RippleModule } from 'primeng/ripple';
import { BrowserAnimationsModule, NoopAnimationsModule } from "@angular/platform-browser/animations";
import { SharedModule } from "primeng/api";

// TODO: Reactive tests after upgrade primeng to a new version and check.

// describe('AggregationDateRangeComponent', () => {

//   let fixture: ComponentFixture<AggregationDateRangeComponent>;
//   let component: AggregationDateRangeComponent;
//   let componentRef: ComponentRef<AggregationDateRangeComponent>;
//   let searchService: RecordSearchService

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       declarations: [AggregationDateRangeComponent],
//       providers: [
//         RecordSearchService
//       ],
//       imports: [
//         CommonModule,
//         BrowserAnimationsModule,
//         NoopAnimationsModule,
//         DatePickerModule,
//         SharedModule,
//         ButtonModule,
//         RippleModule,
//         FormsModule,
//         TranslateModule.forRoot(),
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(AggregationDateRangeComponent);
//     component = fixture.componentInstance;
//     componentRef = fixture.componentRef;
//     searchService = TestBed.inject(RecordSearchService);
//     componentRef.setInput('key', 'date_range');
//     componentRef.setInput('config', {
//       'min': '2025-01-01',
//       'max': '2025-01-31'
//     });
//     fixture.detectChanges();
//   });

//   it('should create', async () => {
//     expect(component).toBeTruthy();
//     expect(component.dateRangeModel).toHaveSize(2);
//     expect(component.buttonConfig).toHaveSize(4);
//   });

//   it('should return a list of active filters', () => {
//     searchService.aggregationsFilters.subscribe(filters => {
//       if (filters) {
//         expect(filters[0]).toEqual({
//           key: 'date_range',
//           values: [`${new Date('2025-01-10').getTime()}--${new Date('2025-01-20').getTime()}`]
//         });
//       }
//     });
//     component.setRange([new Date('2025-01-10'), new Date('2025-01-20')]);
//     expect(component.dateRangeModel[0]).toEqual(new Date('2025-01-10'));
//     expect(component.dateRangeModel[1]).toEqual(new Date('2025-01-20'));
//   });
// });
