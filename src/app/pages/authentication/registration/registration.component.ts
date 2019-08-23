import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService, HUser } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/authentication-http-error-handler.service';

@Component({
  selector: 'hyt-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegistrationComponent implements OnInit {

  error: string;

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
    //DISABLE BUTTON
    this.error = '';
    this.generalError = 0;
    this.registrationSucceeded = false;

    let user: HUser = {
      name: this.registrationForm.value.name,
      lastname: this.registrationForm.value.lastName,
      username: this.registrationForm.value.username,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password,
      passwordConfirm: this.registrationForm.value.confPassword,
      entityVersion: 1
    }

    this.hUserService.register(user).subscribe(
      res => {
        this.registrationSucceeded = true;
        this.loading = false
      },
      err => {
        let k: Map<string, string> = this.httperrorHandler.handleRegistration(err);
        for (let e of k) {
          if (e[0] == 'general') {
            this.error = e[1]
            this.generalError = 1;
          }
          else {
            this.error = e[1]
            this.registrationForm.get(e[0]).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
          }
        }

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
      this.registrationForm.get('password').invalid ||
      this.registrationForm.get('confPassword').invalid
    )
  }

}
