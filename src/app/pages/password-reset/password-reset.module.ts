import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { HusersService } from '@hyperiot/core';
import { PasswordResetComponent } from './password-reset.component'

@NgModule({
  declarations: [
    PasswordResetComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [HusersService]
})
export class PasswordResetModule { }
