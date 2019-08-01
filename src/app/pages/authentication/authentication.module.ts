import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthenticationComponent } from './authentication.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { PasswordRecoveryComponent } from './password-recovery/password-recovery.component';
import { HyperiotComponentsModule } from '@hyperiot/components';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { HytRoutingModule } from 'src/app/configuration-modules/hyt-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    AuthenticationComponent,
    LoginComponent,
    RegistrationComponent,
    PasswordRecoveryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    ReactiveFormsModule,
    HyperiotComponentsModule,
    MatCheckboxModule,
    HytRoutingModule
  ],
  providers: []
})
export class AuthenticationModule { }
