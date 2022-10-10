import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmEventsTableComponent } from './alarm-events-table.component';

describe('AlarmEventsTableComponent', () => {
  let component: AlarmEventsTableComponent;
  let fixture: ComponentFixture<AlarmEventsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmEventsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmEventsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
