import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService, JWTLoginResponse } from '@hyperiot/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationHttpErrorHandlerService } from 'src/app/services/authentication-http-error-handler.service';
import { Handler } from 'src/app/services/models/models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  error: string[] = [null, null, null];

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  injectedErrorState = false;

  constructor(
    private authenticationService: AuthenticationService,
    private cookieService: CookieService,
    private router: Router,
    private httperrorHandler: AuthenticationHttpErrorHandlerService
  ) { }

  ngOnInit() {
  }

  login() {
    this.authenticationService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      res => {
        var jwtToken = <JWTLoginResponse>res;
        this.cookieService.set('HIT-AUTH', jwtToken.token, 2);
        this.router.navigate(['/test']);
      },
      err => {
        let k: Handler[] = this.httperrorHandler.handleLogin(err);
        for (let e of k) {
          this.error[2] = e.message;
        }
      }
    )
  }

}
