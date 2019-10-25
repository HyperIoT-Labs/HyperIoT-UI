import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFormComponent } from './packet-form.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('PacketFormComponent', () => {
  let component: PacketFormComponent;
  let fixture: ComponentFixture<PacketFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketFormComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
