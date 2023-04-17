import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SubmissionStatus } from '../models/pageStatus';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService, LoggerService, Logger } from 'core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

/**
 * PasswordRecoveryComponent is a component of AuthenticationModule.
 * It is used to hallow the user to send the request to reset his account password.
 */
@Component({
  selector: 'hyt-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordRecoveryComponent implements OnInit {

  /**
   * recoverMailForm stores the recover-mail form
   */
  recoverMailForm: FormGroup;

  /**
   * recoverMailStatus is used to handle the template view when the user is making the password-recovery request
   */
  recoverMailStatus: SubmissionStatus = SubmissionStatus.Default;

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
    private hUserService: HusersService,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private fb: FormBuilder,
    private loggerService: LoggerService
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('PasswordRecoveryComponent');
   }

  /**
   * ngOnInit() builds the recoverMailForm
   */
  ngOnInit() {
    this.recoverMailForm = this.fb.group({});
  }

  /**
   * recoveryRequest() is used to let the user recover his password.
   * This function sends the recovery password request (with the mail provided by the user) to the server.
   */
  recoveryRequest() {
    this.recoverMailStatus = SubmissionStatus.Default;
    this.hUserService.resetPasswordRequest(this.recoverMailForm.value.email).subscribe(
      res => {
        this.logger.debug('email address:', res);
        this.recoverMailStatus = SubmissionStatus.Submitted;
      },
      err => {
        const k: HYTError[] = this.httperrorHandler.handlePwdRecovery(err);
        for (const e of k) {
          this.error = e.message;
        }
        this.recoverMailStatus = SubmissionStatus.Error;
      }
    );
  }

  /**
   * notValid() returns false if the recoverMail form is not valid.
   * This function is used by the template.
   */
  notValid(): boolean {
    return this.recoverMailForm.get('email').invalid;
  }

}
