import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsLogSettingsComponent } from './events-log-settings.component';

describe('EventsLogSettingsComponent', () => {
  let component: EventsLogSettingsComponent;
  let fixture: ComponentFixture<EventsLogSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventsLogSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsLogSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
