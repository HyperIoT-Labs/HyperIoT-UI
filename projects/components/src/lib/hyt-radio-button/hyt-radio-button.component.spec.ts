import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HRadioButtonComponent } from './h-radio-button.component';

describe('HRadioButtonComponent', () => {
  let component: HRadioButtonComponent;
  let fixture: ComponentFixture<HRadioButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HRadioButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
