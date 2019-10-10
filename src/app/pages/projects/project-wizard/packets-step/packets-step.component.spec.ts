import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PacketsStepComponent } from './packets-step.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';

describe('PacketsStepComponent', () => {
  let component: PacketsStepComponent;
  let fixture: ComponentFixture<PacketsStepComponent>;
  let fb: FormBuilder;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PacketsStepComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: FormBuilder, useValue: fb}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PacketsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
