import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { HusersService, HUser } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from '../../../services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

@Component({
  selector: 'hyt-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {

  errors: HYTError[] = [];

  /* Flag to display Company Section */
  isCompany: boolean = false;

  /* This field is used as a flag to make the form buttons clickable */
  loading: boolean = false;

  personalInfoForm: FormGroup;
  changePasswordForm: FormGroup;

  generalError = 0;

  exception: boolean = false;
  errorMessage: string[] = [];

  fieldError = new Map();

  /* This variable is used as a flag to make a success message appear when updating personal information goes well. */
  personalInfoUpdated: boolean = false;

  /* This variable is used as a flag to make a success message appear when changing password goes well. */
  passwordChanged: boolean = false;

  /* This variable is used as a flag to make an alert appear when an error occurs. */
  wentWrong: boolean = false;

  /* This variable contains the string to display in case of error while trying to update personal information or change password. */
  errMsg = "something went wrong";

  /* This variable contains the string to display when the personal information update is successful. */
  successMsg = "Personal information updated correctly"

  /* This variable contains the string to display when the password change is successful. */
  succesMsgPwd = "Password changed correctly"

  error: any;

  /* This variable is used to hold account informations of the user logged in. */
  user: HUser;

  /* This variable hold the specific field of the ID for the user logged in. */
  userId: number;

  /* This variable contains the user input for the password to change. */
  oldPassword: string;

  /* This variable contains the user input for the new password. */
  newPassword: string;
 
  /* This variable contains the user input for the new password; entering the new password twice is a confirmation step. */
  confirmPassword: string;
  
  /* This is the constructor of the class. */
  constructor(
    private hUserService: HusersService,
    private fb: FormBuilder,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
  ) { }

  /* This is an angular lifecycle hook that executes certain operations on initialization of the application. */
  ngOnInit() {
    if (localStorage.getItem('user') !== null) {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.userId = this.user.id;
    } else {
      err => { this.errors = this.httperrorHandler.handle(err); }
    }

    this.personalInfoForm = this.fb.group({});
    this.changePasswordForm = this.fb.group({});
  }

  /* This method gets the information entered by the user from the form, sends it as an object of type HUser to the back-end and handles possible errors. */
  updatePersonalInfo() {
    this.loading = true;
    let modifiedUser: HUser = {
      id: this.user.id,
      username: this.personalInfoForm.get('username').value,
      email: this.personalInfoForm.get('email').value,
      name: this.personalInfoForm.get('name').value,
      lastname: this.personalInfoForm.get('lastname').value,
      entityVersion: this.user.entityVersion
    }

    this.hUserService.updateAccountInfo(modifiedUser).subscribe(
      res => {
        this.user = res;
        localStorage.setItem('user', JSON.stringify(res));
        this.personalInfoUpdated = true;
        this.loading = false;
        setTimeout(() => {
          this.personalInfoUpdated = false;
        }, 3000);
      },
      err => {
        this.errors = this.httperrorHandler.handle(err);
        this.loading = false;
        this.personalInfoUpdated = false;
      }
    );
  }

  /* This method gets the information entered by the user in the 'change password' form, sends it to the back-end and handles possible errors. */
  updatePassword() {
    this.loading = true;
    this.oldPassword = this.changePasswordForm.value.oldPassword;
    this.newPassword = this.changePasswordForm.value.newPassword;
    this.confirmPassword = this.changePasswordForm.value.confirmPassword;

    this.hUserService.changeHUserPassword(this.userId, this.oldPassword, this.newPassword, this.confirmPassword).subscribe(
      res => {
        this.passwordChanged = true;
        this.loading = false;
      },
      err => {
        this.errors = this.httperrorHandler.handle(err);
        this.loading = false;
        this.passwordChanged = false;
        this.wentWrong = true;
        this.changePasswordForm.reset();
      }
    );
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.updatePersonalInfo();
      this.updatePassword();
    }
  }

  /* This method performs the form control on input elements for the "personal information" form and returns the status of the elements */
  notValidPif(): boolean {
    return (
      this.personalInfoForm.get('username').invalid ||
      this.personalInfoForm.get('email').invalid ||
      this.personalInfoForm.get('name').invalid ||
      this.personalInfoForm.get('lastname').invalid
    )
  }

  /* This method performs the form control on input elements for the "change password" form and returns the status of the elements */
  notValidCpf(): boolean {
    return (
      this.changePasswordForm.get('oldPassword').invalid ||
      this.changePasswordForm.get('newPassword').invalid ||
      this.changePasswordForm.get('confirmPassword').invalid
    )
  }

}
