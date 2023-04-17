import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { WidgetSettingsDialogComponent } from './widget-settings-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('WidgetSettingsDialogComponent', () => {
  let component: WidgetSettingsDialogComponent;
  let fixture: ComponentFixture<WidgetSettingsDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetSettingsDialogComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
