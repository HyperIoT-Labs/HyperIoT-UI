import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFieldsDataComponent } from './packet-fields-data.component';

describe('PacketFieldsDataComponent', () => {
  let component: PacketFieldsDataComponent;
  let fixture: ComponentFixture<PacketFieldsDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketFieldsDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketFieldsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
