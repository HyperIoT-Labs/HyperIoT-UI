import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HusersService, HUserPasswordReset, Logger, LoggerService } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { SubmissionStatus } from '../models/pageStatus';

@Component({
  selector: 'hyt-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordResetComponent implements OnInit {

  email: string;
  code: string;

  recoverPassForm: FormGroup;

  error: string = null;

  submissionStatus: SubmissionStatus = SubmissionStatus.Default;

  private logger: Logger;

  constructor(
    private route: ActivatedRoute,
    private hUserService: HusersService,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private loggerService: LoggerService
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('PasswordResetComponent');
   }

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
        this.submissionStatus = SubmissionStatus.Submitted; },
      err => {
        const k: HYTError[] = this.httperrorHandler.handlePwdRecovery(err);
        for (const e of k) {
          this.error = e.message;
        }
        this.submissionStatus = SubmissionStatus.Error;
      }

    );
  }

  notValid(): boolean {
    return this.recoverPassForm.get('email').invalid;
  }

}
