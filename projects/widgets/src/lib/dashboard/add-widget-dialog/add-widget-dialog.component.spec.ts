import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { AddWidgetDialogComponent } from './add-widget-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardConfigService } from '../dashboard-config.service';

describe('ModalDialogComponent', () => {
  let component: AddWidgetDialogComponent;
  let fixture: ComponentFixture<AddWidgetDialogComponent>;
  let activatedRoute: ActivatedRoute;
  let router: Router;
  let dashboardConfigService: DashboardConfigService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddWidgetDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: ActivatedRoute, useValue: activatedRoute},
        {provide: Router, useValue: router},
        {provide: DashboardConfigService, useValue: dashboardConfigService}]
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
