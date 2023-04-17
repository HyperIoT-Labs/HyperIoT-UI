import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFieldsSelectComponent } from './packet-fields-select.component';

describe('PacketFieldsSelectComponent', () => {
  let component: PacketFieldsSelectComponent;
  let fixture: ComponentFixture<PacketFieldsSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PacketFieldsSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketFieldsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
