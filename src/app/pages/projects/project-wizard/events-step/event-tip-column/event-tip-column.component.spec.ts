import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTipColumnComponent } from './event-tip-column.component';

describe('EventTipColumnComponent', () => {
  let component: EventTipColumnComponent;
  let fixture: ComponentFixture<EventTipColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventTipColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventTipColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
