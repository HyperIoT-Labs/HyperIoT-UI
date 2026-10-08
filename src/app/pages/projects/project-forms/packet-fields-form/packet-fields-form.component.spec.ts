import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketFieldsFormComponent } from './packet-fields-form.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HPacketService } from 'core';
import { ActivatedRoute, Router } from '@angular/router';

describe('PacketFieldsFormComponent', () => {
  let component: PacketFieldsFormComponent;
  let fixture: ComponentFixture<PacketFieldsFormComponent>;
  let formBuilder: UntypedFormBuilder;
  let hPacketService: HPacketService;
  let activatedRoute: ActivatedRoute;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PacketFieldsFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: UntypedFormBuilder, useValue: formBuilder},
        {provide: HPacketService, useValue: hPacketService},
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
