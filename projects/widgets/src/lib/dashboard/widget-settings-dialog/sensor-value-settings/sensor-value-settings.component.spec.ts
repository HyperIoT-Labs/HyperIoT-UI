import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SensorValueSettingsComponent } from './sensor-value-settings.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgForm } from '@angular/forms';

describe('SensorValueSettingsComponent', () => {
  let component: SensorValueSettingsComponent;
  let fixture: ComponentFixture<SensorValueSettingsComponent>;
  let settingsForm: NgForm;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorValueSettingsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: NgForm, useValue: settingsForm}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorValueSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
