import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketSelectComponent } from './packet-select.component';

describe('PacketSelectComponent', () => {
  let component: PacketSelectComponent;
  let fixture: ComponentFixture<PacketSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
