import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFiltersComponent } from './list-filters.component';
import { BucketNamePipe } from '../bucket-name.pipe';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ListFiltersComponent', () => {
  let component: ListFiltersComponent;
  let fixture: ComponentFixture<ListFiltersComponent>;
  let translateService: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      declarations: [
        ListFiltersComponent,
        BucketNamePipe
      ]
    })
    .compileComponents();
    translateService = TestBed.inject(TranslateService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFiltersComponent);
    component = fixture.componentInstance;
    component.filters = [
      { key: 'on_shelf', aggregationKey: 'status' },
      { key: 'docmaintype_serial', aggregationKey: 'document_type' }
    ];
    translateService.setTranslation('en', {
      on_shelf: 'available',
      docmaintype_serial: 'serial'
    });
    translateService.use('en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 2 buttons', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('li#filter > button');
    expect(buttons.length).toBe(2);
  });

  it('should display button available', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('li#filter > button');
    expect(buttons[0].innerHTML).toContain('available');
  });

  it('should display button serial', () => {
    const buttons = fixture.debugElement.nativeElement.querySelectorAll('li#filter > button');
    expect(buttons[1].innerHTML).toContain('serial');
  });
});
