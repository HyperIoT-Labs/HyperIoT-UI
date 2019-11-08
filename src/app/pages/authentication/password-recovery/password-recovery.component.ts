import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SubmissionStatus } from '../models/pageStatus';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService, LoggerService, Logger } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

@Component({
  selector: 'hyt-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordRecoveryComponent implements OnInit {

  error: string = null;

  submissionStatus: SubmissionStatus = SubmissionStatus.Default;

  recoverMailForm: FormGroup;

  private logger: Logger;

  constructor(
    private hUserService: HusersService,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private fb: FormBuilder,
    private loggerService: LoggerService
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('PasswordRecoveryComponent');
   }

  ngOnInit() {
    this.recoverMailForm = this.fb.group({});
  }

  recoveryRequest() {
    this.submissionStatus = SubmissionStatus.Default;
    this.hUserService.resetPasswordRequest(this.recoverMailForm.value.email).subscribe(
      res => {
        this.logger.debug('email address:', res);
        this.submissionStatus = SubmissionStatus.Submitted;
      },
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
    return this.recoverMailForm.get('email').invalid;
  }

}
