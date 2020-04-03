import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailComponent } from './project-detail.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HprojectsService, HdevicesService, HpacketsService } from '@hyperiot/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HytModalService } from '@hyperiot/components';

describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  let hProjectService: HprojectsService;
  let hDeviceService: HdevicesService;
  let packetService: HpacketsService;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let dialog: HytModalService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectDetailComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: HprojectsService, useValue: hProjectService},
        {provide: HdevicesService, useValue: hDeviceService},
        {provide: HpacketsService, useValue: packetService},
        {provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router},
        {provide: HytModalService, useValue: dialog}]
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
