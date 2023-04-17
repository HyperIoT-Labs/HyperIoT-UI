import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthenticationService, LoggerService, Logger } from 'core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import {SubmissionStatus} from '../hyt-models/pageStatus';
import {
  AuthenticationHttpErrorHandlerService
} from '../hyt-service/errorHandler/authentication-http-error-handler.service';
import {HYTError} from '../hyt-service/errorHandler/models/models';

/**
 * LoginComponent is a component of AuthenticationModule.
 * It is used to hallow the user to login with the credentials of his account.
 */
@Component({
  selector: 'hyt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytLoginComponent implements OnInit {

  /**
   * error is used to handle errors in the template
   */
  error: string[] = [null, null, null];

  /**
   * returnUrl is used to store the url the user wanted to reach before he was redirected by the LoggedInGuard
   */
  returnUrl: string;

  /**
   * loginForm stores the login form
   */
  loginForm: FormGroup =  new FormGroup({

  });

  initialValue = '';

  /**
   * loginStatus is used to handle the template view when the user is logging in
   */
  loginStatus: SubmissionStatus = SubmissionStatus.Default;

  loggedIn = this.isLoggedIn();
  /**
   * injectedErrorState is true if the server returns an error
   */
  injectedErrorState = false;

  // cookies secure CookieService option
  cookieSecure = true;

  /**
   * logger service
   */
  private logger: Logger;

  checked: boolean;

  /**
   * class constructor
   */
  constructor(
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private router: Router,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('LoginComponent');
  }

  /**
   * ngOnInit() builds the loginForm and sets the returnUrl
   */
  ngOnInit() {
    if (this.cookieService.check('rememberme')) {
      this.initialValue = this.cookieService.get('rememberme');
      this.checked = true;
    }

    this.returnUrl = window.history.state.returnUrl || '/';
  }

  onClickCheckbox(event) {
    this.checked = event;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('userInfo');
  }

  /**
   * login() is used to let the user enter in his dedicated environment.
   * This function set the user info in the localstorage and set the JWTTOKEN.
   */
  login() {
    this.loginStatus = SubmissionStatus.Loading;
    this.error = [];

    if (this.loginForm.invalid) {
      return;
    }

    this.authenticationService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      res => {
        this.cookieService.set('HIT-AUTH', res.token, 2, '/', '', this.cookieSecure);
        localStorage.setItem('userInfo', JSON.stringify(res));
        localStorage.setItem('user', JSON.stringify(res.authenticable));
        this.logger.trace('userInfo', JSON.stringify(res.authenticable));

        if (this.checked === true) {
          this.cookieService.set('rememberme', this.loginForm.value.username, 2, '/', '', this.cookieSecure);
        } else {
          const deleteCookie = this.loginForm.value.username === this.cookieService.get('rememberme') && this.cookieService.check('rememberme');
          if (deleteCookie) { this.cookieService.delete('rememberme', '/'); }
        }

        this.loginStatus = SubmissionStatus.Submitted;

        this.router.navigate([this.returnUrl]);
      },
      err => {
        this.logger.error('Invalid account credentials', err);
        const k: HYTError[] = this.httperrorHandler.handleLogin(err);
        for (const e of k) {
          this.error[2] = e.message;
        }
        this.loginStatus = SubmissionStatus.Error;
      }
    );
  }

  /**
   * keyDownFunction() is used to trigger login() when 'ENTER' key is pressed
   * @param event the key pressed
   */
  keyUpFunction(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.login();
    }
  }

  /**
   * returns false if the login form is not valid.
   * This function is used by the template.
   */
  notValid(): boolean {
    return (
      this.loginForm.get('username').invalid ||
      this.loginForm.get('password').invalid
    );
  }

}
