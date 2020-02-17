import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextReadMoreComponent } from './text-read-more.component';
import { Nl2brPipe} from '../pipe/nl2br.pipe';

describe('TextReadMoreComponent', () => {
  let component: TextReadMoreComponent;
  let fixture: ComponentFixture<TextReadMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextReadMoreComponent, Nl2brPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextReadMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
