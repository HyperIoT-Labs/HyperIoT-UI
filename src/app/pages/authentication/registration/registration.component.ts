import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService, HUser, LoggerService, Logger } from 'core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { SubmissionStatus } from '../models/pageStatus';

/**
 * RegistrationComponent is a component of AuthenticationModule.
 * It is used to hallow the user to create his own account.
 */
@Component({
  selector: 'hyt-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegistrationComponent implements OnInit {

  /**
   * error is used to handle errors in the template
   */
  errors: HYTError[] = [];

  /**
   * registrationForm stores the registration form
   */
  registrationForm: FormGroup;

  /**
   * registrationStatus is used to handle the template view when the user is creating an account
   */
  registrationStatus: SubmissionStatus = SubmissionStatus.Default;

  /**
   * logger service
   */
  private logger: Logger;

  checked: boolean = false;

  /**
   * class constructor
   */
  constructor(
    private hUserService: HusersService,
    private fb: FormBuilder,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private loggerService: LoggerService
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('RegistrationComponent');
  }

  /**
   * ngOnInit() builds the registrationForm
   */
  ngOnInit() {
    this.registrationForm = this.fb.group({});
  }

  onClickCheckbox(event) {
    this.checked = event;
  }

  /**
   * register() is used to let the user create his account.
   * This function sends the request to the server.
   */
  register() {
    this.registrationStatus = SubmissionStatus.Loading;
    this.errors = [];

    const user: HUser = {
      name: this.registrationForm.value.name,
      lastname: this.registrationForm.value.lastName,
      username: this.registrationForm.value.username,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value['huser-password'],
      passwordConfirm: this.registrationForm.value['huser-passwordConfirm'],
      entityVersion: 1
    };

    this.hUserService.register(user).subscribe(
      res => {
        this.registrationStatus = SubmissionStatus.Submitted;
      },
      err => {
        this.errors = this.httperrorHandler.handleRegistration(err);
        this.errors.forEach(e => {
          if (e.container !== 'general') {
            this.registrationForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
          }
        });
        this.registrationStatus = SubmissionStatus.Error;
      }
    );
  }

  /**
   * notValid() returns false if the registration form is not valid.
   * This function is used by the template.
   */
  notValid(): boolean {
    return (
      this.registrationForm.get('name').invalid ||
      this.registrationForm.get('lastName').invalid ||
      this.registrationForm.get('username').invalid ||
      this.registrationForm.get('email').invalid ||
      this.registrationForm.get('huser-password').invalid ||
      this.registrationForm.get('huser-passwordConfirm').invalid ||
      this.checked === false
    );
  }

  /**
   * getError() is used by the template to get errors returned by the server
   * @param field The field to check for errors
   */
  getError(field: string): string {
    return (this.errors.find(x => x.container === field)) ? this.errors.find(x => x.container === field).message : null;
  }

}
