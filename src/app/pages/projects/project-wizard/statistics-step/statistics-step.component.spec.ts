import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsStepComponent } from './statistics-step.component';

describe('StatisticsStepComponent', () => {
  let component: StatisticsStepComponent;
  let fixture: ComponentFixture<StatisticsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatisticsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
