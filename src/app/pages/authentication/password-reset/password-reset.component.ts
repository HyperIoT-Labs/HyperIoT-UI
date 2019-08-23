import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HusersService, HUserPasswordReset } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';
import { Handler } from 'src/app/services/models/models';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/authentication-http-error-handler.service';
import { SubmissionStatus } from '../models/pageStatus';

@Component({
  selector: 'app-password-reset',
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

  constructor(
    private route: ActivatedRoute,
    private hUserService: HusersService,
    private httperrorHandler: AuthenticationHttpErrorHandlerService
  ) { }

  ngOnInit() {

    this.recoverPassForm = new FormGroup({});

    this.route.paramMap.subscribe(
      (p) => {
        this.email = p.get('email');
        this.code = p.get('code');
      }
    )

  }

  resetPwd() {

    var pwdReset: HUserPasswordReset = {
      password: this.recoverPassForm.value.password,
      passwordConfirm: this.recoverPassForm.value.confPassword,
      email: this.email,
      resetCode: this.code
    }

    console.log(pwdReset)

    this.hUserService.resetPassword(pwdReset).subscribe(
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
    return this.recoverPassForm.get('email').invalid;
  }

}
