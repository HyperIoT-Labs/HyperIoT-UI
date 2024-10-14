import { ComponentFixture, TestBed, waitForAsync  } from '@angular/core/testing';

import { GaugeSettingsComponent } from './gauge-settings.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgForm } from '@angular/forms';

describe('GaugeSettingsComponent', () => {
  let component: GaugeSettingsComponent;
  let fixture: ComponentFixture<GaugeSettingsComponent>;
  let settingsForm: NgForm;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GaugeSettingsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: NgForm, useValue: settingsForm}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
