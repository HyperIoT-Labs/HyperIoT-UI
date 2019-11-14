import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService, LoggerService, Logger } from '@hyperiot/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

import * as CryptoJS from 'crypto-js';
import { SubmissionStatus } from '../models/pageStatus';

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
export class LoginComponent implements OnInit {

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
  loginForm: FormGroup;

  /**
   * The key used to encrypt username and password
   */
  private key = '9$&hy7Ke2/';

  /**
   * The encrypted username and password
   */
  private encrypted;

  // private decrypted;

  /**
   * loginStatus is used to handle the template view when the user is logging in
   */
  loginStatus: SubmissionStatus = SubmissionStatus.Default;

  /**
   * injectedErrorState is true if the server returns an error
   */
  injectedErrorState = false;

  /**
   * logger service
   */
  private logger: Logger;

  /**
   * class constructor
   */
  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private httperrorHandler: AuthenticationHttpErrorHandlerService,
    private loggerService: LoggerService) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('LoginComponent');
  }

  /**
   * ngOnInit() builds the loginForm and set the returnUrl
   */
  ngOnInit() {
    this.loginForm = this.fb.group({});
    this.returnUrl = window.history.state.returnUrl || '/';
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
        this.logger.debug('username and password:', res);
        this.cookieService.set('HIT-AUTH', res.token, 2, '/');
        localStorage.setItem('userInfo', JSON.stringify(res));
        localStorage.setItem('user', JSON.stringify(res.authenticable));
        this.logger.trace('userInfo', JSON.stringify(res.authenticable));

        if (this.loginForm.value.rememberMe === true) {
          this.encrypting(this.loginForm.value.username + '&' + this.loginForm.value.password, this.key);
          this.cookieService.set('hytUser', this.encrypted, 28, '/');
        } else if (this.cookieService.check('hytUser')) {
          this.cookieService.delete('hytUser', '/');
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
   * keyDownFunction() is used to trigger login() whaen 'ENTER' key is pressed
   * @param event the key pressed
   */
  keyDownFunction(event) {
    if (event.keyCode === 13) {
      this.login();
    }
  }

  /**
   * encrypting() is used to encript a string with CryptoJS
   * @param message the string to encrypt
   * @param key the key used to encrypt
   */
  private encrypting(message: string, key: string) {
    this.encrypted = CryptoJS.AES.encrypt(message, key);
  }

  // private decrypting(encrypted: string, key: string) {
  //   this.decrypted = CryptoJS.AES.decrypt(encrypted, key);
  // }

  /**
   * notValid() returns false if the login form is not valid.
   * This function is used by the template.
   */
  notValid(): boolean {
    return (
      this.loginForm.get('username').invalid ||
      this.loginForm.get('password').invalid
    );
  }

}
