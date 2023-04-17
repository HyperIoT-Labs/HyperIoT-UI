import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HytStepperComponent } from './hyt-stepper.component';

describe('HytStepperComponent', () => {
  let component: HytStepperComponent;
  let fixture: ComponentFixture<HytStepperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HytStepperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HytStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
