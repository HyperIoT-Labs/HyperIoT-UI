import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesStepComponent } from './devices-step.component';

describe('DevicesStepComponent', () => {
  let component: DevicesStepComponent;
  let fixture: ComponentFixture<DevicesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
