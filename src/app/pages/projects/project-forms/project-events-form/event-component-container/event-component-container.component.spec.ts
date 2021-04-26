import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventComponentContainerComponent } from './event-component-container.component';

describe('EventComponentContainerComponent', () => {
  let component: EventComponentContainerComponent;
  let fixture: ComponentFixture<EventComponentContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventComponentContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventComponentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
