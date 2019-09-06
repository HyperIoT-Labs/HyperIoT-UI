import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/authentication-http-error-handler.service';

@Component({
  selector: 'hyt-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ProfileComponent implements OnInit {

  /* Flag to display Company Section */
  isCompany : boolean = false;

  loading: boolean = false;

  personalInfoForm: FormGroup;
  changePasswordForm: FormGroup;

  generalError = 0;

  exception: boolean = false;
  errorMessage: string[] = [];

  fieldError = new Map();

  personalInfoUpdated: boolean = false;

  constructor(
    private hUserService: HusersService,
    private fb: FormBuilder,
    private httperrorHandler: AuthenticationHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.personalInfoForm = this.fb.group({});
    this.changePasswordForm = this.fb.group({});
  }

  updatePersonalInfo() {
  }

  notValid(): boolean {
    return (
      this.personalInfoForm.get('username').invalid ||
      this.personalInfoForm.get('email').invalid ||
      this.personalInfoForm.get('name').invalid ||
      this.personalInfoForm.get('lastname').invalid
    )
  }

}
