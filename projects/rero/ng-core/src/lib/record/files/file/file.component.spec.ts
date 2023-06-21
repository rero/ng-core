import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileComponent } from './file.component';
import { RecordUiService } from '../../record-ui.service';
import { TranslateModule } from '@ngx-translate/core';

const recordUiServiceSpy = jasmine.createSpyObj('RecordUiService', ['getResourceConfig']);
recordUiServiceSpy.getResourceConfig.and.returnValue({ key: 'documents', files: {} });
describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileComponent],
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: RecordUiService, useValue: recordUiServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    component.type = 'documents';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
