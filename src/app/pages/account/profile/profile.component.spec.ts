import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponent } from './profile.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HusersService } from 'core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  const formBuilder: FormBuilder = new FormBuilder();
  let hUserService: HusersService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileComponent ],
      imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, FormsModule],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        { provide: HusersService, useValue: hUserService}
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    // component.personalInfoForm = formBuilder.group({});
    // component.changePasswordForm = formBuilder.group({});

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('', () => {});

  it('...', () => {

    expect(component.personalInfoForm.valid).toBeTruthy();
  });

  it('', () => {
    expect(component.changePasswordForm.valid).toBeFalsy();
  });
});
