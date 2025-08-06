import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailComponent } from './project-detail.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HProjectService, HDevicesService, HPacketService } from 'core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'components';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let hProjectService: HProjectService;
  let hDeviceService: HDevicesService;
  let packetService: HPacketService;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let dialog: DialogService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDetailComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: HProjectService, useValue: hProjectService},
        {provide: HDevicesService, useValue: hDeviceService},
        {provide: HPacketService, useValue: packetService},
        {provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router},
        {provide: DialogService, useValue: dialog}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
