import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketSelectComponent } from './packet-select.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HpacketsService } from '@hyperiot/core';
import { NgForm } from '@angular/forms';

describe('PacketSelectComponent', () => {
  let component: PacketSelectComponent;
  let fixture: ComponentFixture<PacketSelectComponent>;
  let packetService: HpacketsService;
  let settingsForm: NgForm;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketSelectComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: HpacketsService, useValue: packetService}, {provide: NgForm, useValue: settingsForm}]
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
