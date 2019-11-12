import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HusersService, Logger, LoggerService } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';
import { SubmissionStatus } from '../models/pageStatus';

/**
 * UserActivationComponent is a component of AuthenticationModule.
 * It is used to hallow the user to activate his new account and to finish the registration process.
 */
@Component({
  selector: 'hyt-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss']
})
export class UserActivationComponent implements OnInit {

  /**
   * activationStatus is used to handle the template view during the activation process
   */
  activationStatus: SubmissionStatus = SubmissionStatus.Default;

  /**
   * the user email extrapolated from the url
   */
  email: string;

  /**
   * the activation code extrapolated from the url
   */
  code: string;

  /**
   * logger service
   */
  private logger: Logger;

  /**
   * class constructor
   */
  constructor(private route: ActivatedRoute, private hUserService: HusersService, private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('UserActivationComponent');
  }

  /**
   * ngOnInit() sets the email and reset code extracted from the url and triggers activate() method
   */
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

  /**
   * recoveryRequest() is used to send the account activation request to the server
   * This function sends the account activation request with the email and the activation code.
   */
  activate() {
    this.hUserService.activate(this.email, this.code).subscribe(
      res => {
        this.logger.debug('', res);
        this.activationStatus = SubmissionStatus.Submitted; },
      err => {
        this.logger.error('', err);
        this.activationStatus = SubmissionStatus.Error; }
    );
  }

}
