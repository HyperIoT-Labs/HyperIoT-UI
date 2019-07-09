import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PasswordResetComponent } from './password-reset.component'

@NgModule({
  declarations: [
    PasswordResetComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: []
})
export class PasswordResetModule { }
