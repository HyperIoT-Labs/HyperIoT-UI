import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AuthenticationComponent } from './authentication.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { ComponentsModule } from 'components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HytRoutingModule } from 'src/app/configuration-modules/hyt-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { UserActivationComponent } from './user-activation/user-activation.component';

@NgModule({
  declarations: [
    AuthenticationComponent,
    LoginComponent,
    RegistrationComponent,
    PasswordRecoveryComponent,
    PasswordResetComponent,
    UserActivationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    ComponentsModule,
    MatCheckboxModule,
    HytRoutingModule,
    FormsModule
  ],
  providers: []
})
export class AuthenticationModule { }
