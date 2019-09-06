import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTelInputComponent } from './my-tel-input.component';

describe('MyTelInputComponent', () => {
  let component: MyTelInputComponent;
  let fixture: ComponentFixture<MyTelInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTelInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTelInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
