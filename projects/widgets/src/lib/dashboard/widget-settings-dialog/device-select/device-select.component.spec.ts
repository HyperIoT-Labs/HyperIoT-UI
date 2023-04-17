import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { DeviceSelectComponent } from './device-select.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HpacketsService } from '@hyperiot/core';
import { NgForm } from '@angular/forms';

describe('PacketSelectComponent', () => {
  let component: DeviceSelectComponent;
  let fixture: ComponentFixture<DeviceSelectComponent>;
  let packetService: HpacketsService;
  let settingsForm: NgForm;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceSelectComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: HpacketsService, useValue: packetService}, {provide: NgForm, useValue: settingsForm}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
