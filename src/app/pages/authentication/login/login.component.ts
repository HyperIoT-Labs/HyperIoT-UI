import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService, LoggerService, Logger } from '@hyperiot/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

import * as CryptoJS from 'crypto-js';
import { SubmissionStatus } from '../models/pageStatus';
import { environment } from 'src/environments/environment';

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

  private decrypted;

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
    private fb: FormBuilder,
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
      // this.decrypting(this.cookieService.get('hytUser'), this.key);

      this.loginForm = this.fb.group({
        username: this.cookieService.get('rememberme'),
      });

      this.initialValue = this.loginForm.value.username;
      this.checked = true;

    } else {
      this.loginForm = this.fb.group({});
    }

    this.returnUrl = window.history.state.returnUrl || '/';
  }

  onClickCheckbox(event) {
    this.checked = event;
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('userInfo')) {
      return true;
    } else {
      return false;
    }
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
        this.cookieService.set('HIT-AUTH', res.token, 2, '/', '', environment.cookieSecure);
        localStorage.setItem('userInfo', JSON.stringify(res));
        localStorage.setItem('user', JSON.stringify(res.authenticable));
        this.logger.trace('userInfo', JSON.stringify(res.authenticable));

        if (this.checked === true) {
          if (!this.cookieService.check('rememberme')) { this.cookieService.set('rememberme', this.loginForm.value.username, 2, '/', '', environment.cookieSecure); }
        } else {
          if (this.cookieService.check('rememberme')) { this.cookieService.delete('rememberme', '/'); }
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

  private decrypting(encrypted: string, key: string) {
    this.decrypted = CryptoJS.AES.decrypt(encrypted, key);
  }

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
