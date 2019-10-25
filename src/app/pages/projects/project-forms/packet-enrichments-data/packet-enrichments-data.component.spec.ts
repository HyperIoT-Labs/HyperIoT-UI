import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketEnrichmentsDataComponent } from './packet-enrichments-data.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HpacketsService, HdevicesService } from '@hyperiot/core';
import { ActivatedRoute, Router } from '@angular/router';

describe('PacketEnrichmentsDataComponent', () => {
  let component: PacketEnrichmentsDataComponent;
  let fixture: ComponentFixture<PacketEnrichmentsDataComponent>;
  let formBuilder: FormBuilder;
  let hPacketService: HpacketsService;
  let hDeviceService: HdevicesService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketEnrichmentsDataComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: FormBuilder, useValue: formBuilder},
        {provide: HpacketsService, useValue: hPacketService},
        {provide: HdevicesService, useValue: hDeviceService},
        {provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketEnrichmentsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
