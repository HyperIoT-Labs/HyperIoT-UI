import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketDataComponent } from './packet-data.component';

describe('PacketDataComponent', () => {
  let component: PacketDataComponent;
  let fixture: ComponentFixture<PacketDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
