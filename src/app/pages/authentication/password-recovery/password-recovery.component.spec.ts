import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRecoveryComponent } from './password-recovery.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HusersService, LoggerService } from 'core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { FormBuilder } from '@angular/forms';

describe('PasswordRecoveryComponent', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;
  let hUserService: HusersService;
  let httperrorHandler: AuthenticationHttpErrorHandlerService;
  let fb: FormBuilder;
  let loggerService: LoggerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordRecoveryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{provide: HusersService, useValue: hUserService}, 
        {provide: AuthenticationHttpErrorHandlerService, useValue: httperrorHandler},
        {provide: FormBuilder, useValue: fb}, 
        {provide: LoggerService, useValue: loggerService}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordRecoveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
