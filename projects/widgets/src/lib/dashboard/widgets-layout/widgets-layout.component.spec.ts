import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { WidgetsDashboardLayoutComponent } from './widgets-layout.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('WidgetsDashboardLayoutComponent', () => {
  let component: WidgetsDashboardLayoutComponent;
  let fixture: ComponentFixture<WidgetsDashboardLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetsDashboardLayoutComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetsDashboardLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
