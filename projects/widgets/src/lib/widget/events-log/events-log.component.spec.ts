import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsLogComponent } from './events-log.component';

describe('EventsLogComponent', () => {
  let component: EventsLogComponent;
  let fixture: ComponentFixture<EventsLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
