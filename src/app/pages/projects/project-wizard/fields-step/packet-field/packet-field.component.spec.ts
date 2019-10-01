import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFieldComponent } from './packet-field.component';

describe('PacketFieldComponent', () => {
  let component: PacketFieldComponent;
  let fixture: ComponentFixture<PacketFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
