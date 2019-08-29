import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketsStepComponent } from './packets-step.component';

describe('PacketsStepComponent', () => {
  let component: PacketsStepComponent;
  let fixture: ComponentFixture<PacketsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
