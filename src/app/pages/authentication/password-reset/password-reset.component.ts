import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HusersService, HUserPasswordReset, Logger, LoggerService } from 'core';
import { ActivatedRoute } from '@angular/router';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { SubmissionStatus } from '../models/pageStatus';

/**
 * PasswordResetComponent is a component of AuthenticationModule.
 * It is used to hallow the user to reset his account password.
 */
@Component({
  selector: 'hyt-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordResetComponent implements OnInit {

  /**
   * the user email extrapolated from the url
   */
  email: string;

  /**
   * the request code extrapolated from the url
   */
  code: string;

  /**
   * recoverPassForm stores the password-reset form
   */
  recoverPassForm: FormGroup;

  /**
   * pwdResetStatus is used to handle the template view when the user is making the password-reset request
   */
  pwdResetStatus: SubmissionStatus = SubmissionStatus.Default;

  /**
   * error stores the errors returned by the server
   */
  error: string = null;

  /**
   * logger service
   */
  private logger: Logger;

  /**
   * class constructor
   */
  constructor(
    private route: ActivatedRoute,
    private hUserService: HusersService,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private loggerService: LoggerService
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('PasswordResetComponent');
   }

  /**
   * ngOnInit() builds the password-reset form and sets the email and reset code extracted from the url
   */
  ngOnInit() {

    this.recoverPassForm = new FormGroup({});

    this.route.paramMap.subscribe(
      (p) => {
        this.logger.debug('data:', p);
        this.email = p.get('email');
        this.code = p.get('code');
      }
    );

  }

  /**
   * resetPwd() is used to let the user reset his account password.
   * This function send the password-reset request to the server with the new password provided by the user,
   * the email and the reset-password code.
   */
  resetPwd() {

    const pwdReset: HUserPasswordReset = {
      password: this.recoverPassForm.value.password,
      passwordConfirm: this.recoverPassForm.value.confPassword,
      email: this.email,
      resetCode: this.code
    };

    this.hUserService.resetPassword(pwdReset).subscribe(
      res => {
        this.logger.debug('', res);
        this.pwdResetStatus = SubmissionStatus.Submitted; },
      err => {
        const k: HYTError[] = this.httperrorHandler.handlePwdRecovery(err);
        for (const e of k) {
          this.error = e.message;
        }
        this.pwdResetStatus = SubmissionStatus.Error;
      }

    );
  }

  /**
   * notValid() returns false if the password-reset form is not valid.
   * This function is used by the template.
   */
  notValid(): boolean {
    return this.recoverPassForm.get('email').invalid;
  }

}
