import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketTableSelectComponent } from './packet-table-select.component';

describe('PacketTableSelectComponent', () => {
  let component: PacketTableSelectComponent;
  let fixture: ComponentFixture<PacketTableSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketTableSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketTableSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
