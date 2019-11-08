import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HusersService, Logger, LoggerService } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';
import { SubmissionStatus } from '../models/pageStatus';

@Component({
  selector: 'hyt-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss']
})
export class UserActivationComponent implements OnInit {

  submissionStatus: SubmissionStatus = SubmissionStatus.Default;

  email: string;
  code: string;

  activationForm = new FormGroup({
    code: new FormControl('')
  });

  status = '';

  private logger: Logger;

  constructor(private route: ActivatedRoute, private hUserService: HusersService, private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('UserActivationComponent');
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (p) => {
        this.logger.debug('', p);
        this.email = p.get('email');
        this.code = p.get('code');
        this.activate();
      },
      err => {
        this.logger.error('', err);
      }
    );
  }

  activate() {
    this.hUserService.activate(this.email, this.code).subscribe(
      res => {
        this.logger.debug('', res);
        this.submissionStatus = SubmissionStatus.Submitted; },
      err => {
        this.logger.error('', err);
        this.submissionStatus = SubmissionStatus.Error; }
    );
  }

}
