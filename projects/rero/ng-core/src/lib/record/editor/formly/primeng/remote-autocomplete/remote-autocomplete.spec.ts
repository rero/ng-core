import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteAutocompleteComponent } from './remote-autocomplete';

describe('RemoteAutocompleteComponent', () => {
  let component: RemoteAutocompleteComponent;
  let fixture: ComponentFixture<RemoteAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RemoteAutocompleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
