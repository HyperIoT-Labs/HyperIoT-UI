import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsStepComponent } from './events-step.component';

describe('EventsStepComponent', () => {
  let component: EventsStepComponent;
  let fixture: ComponentFixture<EventsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
