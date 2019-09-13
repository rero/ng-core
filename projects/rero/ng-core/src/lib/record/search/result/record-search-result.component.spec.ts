/*
 * Invenio angular core
 * Copyright (C) 2019 RERO
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
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { RecordSearchResultComponent } from './record-search-result.component';
import { JsonComponent } from './item/json.component';
import { RecordSearchResultDirective } from './record-search-result.directive';

describe('RecordSearchResultComponent', () => {
  let component: RecordSearchResultComponent;
  let fixture: ComponentFixture<RecordSearchResultComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        JsonComponent,
        RecordSearchResultDirective,
        RecordSearchResultComponent
      ],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [JsonComponent],
        }
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a custom component view', () => {
    component.itemViewComponent = JsonComponent;
    component.loadItemView();
  });

  it('should delete record', () => {
    component.deletedRecord.subscribe((pid: string) => {
      expect(pid).toBe('1');
    });
    component.deleteRecord(new Event('click'), '1');
  });

  it('should resolve custom detail URL', () => {
    component.record = {
      id: '1',
      metadata: {
        pid: '1'
      }
    };
    component.type = 'documents';
    component.detailUrl = '/custom/url/to/detail/:type/:pid';
    expect(component.formattedDetailUrl).toBe('/custom/url/to/detail/documents/1');
  });
});
