import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthenticationComponent } from './authentication.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { HyperiotComponentsModule } from '@hyperiot/components';

@NgModule({
  declarations: [
    AuthenticationComponent,
    LoginComponent,
    RegistrationComponent,
    PasswordRecoveryComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HyperiotComponentsModule
  ],
  providers: []
})
export class AuthenticationModule { }
