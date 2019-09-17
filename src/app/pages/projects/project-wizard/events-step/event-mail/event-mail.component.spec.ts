import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventMailComponent } from './event-mail.component';

describe('EventMailComponent', () => {
  let component: EventMailComponent;
  let fixture: ComponentFixture<EventMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
