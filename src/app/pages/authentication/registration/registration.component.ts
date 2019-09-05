import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService, HUser } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

@Component({
  selector: 'hyt-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegistrationComponent implements OnInit {

  errors: HYTError[] = [];

  registrationForm: FormGroup;
  //  = new FormGroup({
  //   acceptConditions: new FormControl(false, [
  //     Validators.required
  //   ])
  // });

  loading: boolean = false;

  constructor(
    private hUserService: HusersService,
    private fb: FormBuilder,
    private httperrorHandler: AuthenticationHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.registrationForm = this.fb.group({});
  }

  generalError = 0;

  exception: boolean = false;
  errorMessage: string[] = [];

  fieldError = new Map();

  registrationSucceeded: boolean = false;

  register() {
    this.errors = [];
    this.generalError = 0;
    this.registrationSucceeded = false;

    let user: HUser = {
      name: this.registrationForm.value.name,
      lastname: this.registrationForm.value.lastName,
      username: this.registrationForm.value.username,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value['huser-password'],
      passwordConfirm: this.registrationForm.value['huser-passwordConfirm'],
      entityVersion: 1
    }

    this.hUserService.register(user).subscribe(
      res => {
        this.registrationSucceeded = true;
        this.loading = false
      },
      err => {
        this.errors = this.httperrorHandler.handleRegistration(err);
        this.errors.forEach(e => {
          console.log(e)
          if (e.container != 'general')
            this.registrationForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
        this.loading = false
      }
    )
  }

  notValid(): boolean {
    return (
      this.registrationForm.get('name').invalid ||
      this.registrationForm.get('lastName').invalid ||
      this.registrationForm.get('username').invalid ||
      this.registrationForm.get('email').invalid ||
      this.registrationForm.get('huser-password').invalid ||
      this.registrationForm.get('huser-passwordConfirm').invalid
    )
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

}
