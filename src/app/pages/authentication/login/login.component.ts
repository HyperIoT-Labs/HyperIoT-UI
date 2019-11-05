import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService, JWTLoginResponse, LoggerService, Logger } from '@hyperiot/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/errorHandler/authentication-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'hyt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {

  error: string[] = [null, null, null];

  returnUrl: String;

  loginForm: FormGroup;

  cookieValue: String;

  private key: string = "9$&hy7Ke2/";

  private encrypted;

  private decrypted;

  loading: boolean = false;

  injectedErrorState = false;

  private logger: Logger;

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

  ngOnInit() {

    this.loginForm = this.fb.group({});

    this.returnUrl = window.history.state.returnUrl || '/';

  }

  login() {
    this.loading = true;
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
 
        if (this.loginForm.value.rememberMe == true) {
          this.encrypting(this.loginForm.value.username + "&" + this.loginForm.value.password, this.key);
          this.cookieService.set('hytUser', this.encrypted, 28, '/');
          this.cookieValue = this.cookieService.get('hytUser');
        } else if (this.cookieService.check('hytUser')) {
          this.cookieService.delete('hytUser', '/');
        }
        this.loading = false;

        this.router.navigate([this.returnUrl]);
      },
      err => {
        this.logger.error('Invalid account credentials', err);
        let k: HYTError[] = this.httperrorHandler.handleLogin(err);
        for (let e of k) {
          this.error[2] = e.message;
        }
        this.loading = false;
      }
    )
  }

  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.login()
    }
  }

  private encrypting(message: string, key: string) {
    this.encrypted = CryptoJS.AES.encrypt(message, key);
  }

  private decrypting(encrypted: string, key: string) {
    this.decrypted = CryptoJS.AES.decrypt(encrypted, key);
  }

  notValid(): boolean {
    return (
      this.loginForm.get('username').invalid ||
      this.loginForm.get('password').invalid
    )
  }

}
