import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFieldsFormComponent } from './packet-fields-form.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HpacketsService } from 'core';
import { ActivatedRoute, Router } from '@angular/router';

describe('PacketFieldsFormComponent', () => {
  let component: PacketFieldsFormComponent;
  let fixture: ComponentFixture<PacketFieldsFormComponent>;
  let formBuilder: FormBuilder;
  let hPacketService: HpacketsService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PacketFieldsFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: FormBuilder, useValue: formBuilder},
        {provide: HpacketsService, useValue: hPacketService}, 
        {provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
