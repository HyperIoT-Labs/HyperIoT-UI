import { Component, OnInit } from '@angular/core';
import { SubmissionStatus } from '../models/pageStatus';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HusersService } from '@hyperiot/core';

@Component({
  selector: 'app-password-recovery',
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit {

  submissionStatus: SubmissionStatus = SubmissionStatus.Default;

  recoverMailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private hUserService: HusersService) { }

  ngOnInit() {
  }

  recoveryRequest() {
    this.submissionStatus = SubmissionStatus.Default
    this.hUserService.resetPasswordRequest(this.recoverMailForm.value.email).subscribe(
      res => { this.submissionStatus = SubmissionStatus.Submitted },
      err => { this.submissionStatus = SubmissionStatus.Error }
    )
  }
  
}
