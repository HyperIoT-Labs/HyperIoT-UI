import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEventComponent } from './packet-event.component';

describe('PacketEventComponent', () => {
  let component: PacketEventComponent;
  let fixture: ComponentFixture<PacketEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
