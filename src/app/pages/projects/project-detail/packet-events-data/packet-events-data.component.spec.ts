import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEventsDataComponent } from './packet-events-data.component';

describe('PacketEventsDataComponent', () => {
  let component: PacketEventsDataComponent;
  let fixture: ComponentFixture<PacketEventsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEventsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEventsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
