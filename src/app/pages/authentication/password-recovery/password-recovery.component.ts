import { Component, OnInit } from '@angular/core';
import { SubmissionStatus } from '../models/pageStatus';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HusersService } from '@hyperiot/core';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/authentication-http-error-handler.service';
import { Handler } from 'src/app/services/models/models';

@Component({
  selector: 'hyt-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {

  error: string[] = [null]

  submissionStatus: SubmissionStatus = SubmissionStatus.Default;

  recoverMailForm = new FormGroup({
    email: new FormControl('', [])
  });

  constructor(private hUserService: HusersService, private httperrorHandler: AuthenticationHttpErrorHandlerService) { }

  ngOnInit() {
  }

  recoveryRequest() {
    this.submissionStatus = SubmissionStatus.Default
    this.hUserService.resetPasswordRequest(this.recoverMailForm.value.email).subscribe(
      res => { this.submissionStatus = SubmissionStatus.Submitted },
      err => {
        let k: Handler[] = this.httperrorHandler.handlePwdRecovery(err);
        for (let e of k) {
          this.error[0] = e.message;
        }
        console.log(this.error)
        this.submissionStatus = SubmissionStatus.Error;
      }
    )
  }

}
