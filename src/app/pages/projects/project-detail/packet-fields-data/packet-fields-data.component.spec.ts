import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFieldsDataComponent } from './packet-fields-data.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HpacketsService } from '@hyperiot/core';
import { ActivatedRoute, Router } from '@angular/router';

describe('PacketFieldsDataComponent', () => {
  let component: PacketFieldsDataComponent;
  let fixture: ComponentFixture<PacketFieldsDataComponent>;
  let formBuilder: FormBuilder;
  let hPacketService: HpacketsService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PacketFieldsDataComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: FormBuilder, useValue: formBuilder},
        {provide: HpacketsService, useValue: hPacketService}, 
        {provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router}]
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
