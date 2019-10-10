import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsStepComponent } from './events-step.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EventsStepComponent', () => {
  let component: EventsStepComponent;
  let fixture: ComponentFixture<EventsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsStepComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
