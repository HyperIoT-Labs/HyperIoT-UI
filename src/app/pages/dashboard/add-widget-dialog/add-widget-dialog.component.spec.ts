import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWidgetDialogComponent } from './add-widget-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardConfigService } from '../dashboard-config.service';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';

describe('ModalDialogComponent', () => {
  let component: AddWidgetDialogComponent;
  let fixture: ComponentFixture<AddWidgetDialogComponent>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let dashboardConfigService: DashboardConfigService;
  let hytModalService: HytModalConfService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddWidgetDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router},
        {provide: DashboardConfigService, useValue: dashboardConfigService},
        {provide: HytModalConfService, useValue: hytModalService}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWidgetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
