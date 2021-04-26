import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMqttCommandComponent } from './event-mqtt-command.component';

describe('EventMqttCommandComponent', () => {
  let component: EventMqttCommandComponent;
  let fixture: ComponentFixture<EventMqttCommandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventMqttCommandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMqttCommandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
