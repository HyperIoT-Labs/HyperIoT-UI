import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SubmissionStatus } from '../models/pageStatus';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HusersService } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/authentication-http-error-handler.service';
import { Handler } from 'src/app/services/models/models';

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

  constructor(private hUserService: HusersService,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.recoverMailForm = this.fb.group({});
  }

  recoveryRequest() {
    this.submissionStatus = SubmissionStatus.Default
    this.hUserService.resetPasswordRequest(this.recoverMailForm.value.email).subscribe(
      res => { this.submissionStatus = SubmissionStatus.Submitted },
      err => {
        let k: Handler[] = this.httperrorHandler.handlePwdRecovery(err);
        for (let e of k) {
          this.error = e.message;
        }
        this.submissionStatus = SubmissionStatus.Error;
      }
    )
  }

  notValid(): boolean {
    return this.recoverMailForm.get('email').invalid;
  }

}
