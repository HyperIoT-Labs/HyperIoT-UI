import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService, JWTLoginResponse } from '@hyperiot/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginStatus: number = -1;

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(private authenticationService: AuthenticationService, private cookieService: CookieService, private router: Router) { }

  ngOnInit() {
  }

  login() {
    this.authenticationService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      res => {
        this.loginStatus = 200;
        var jwtToken = <JWTLoginResponse>res;
        this.cookieService.set('HIT-AUTH', jwtToken.token, 30);
        this.router.navigate(['/test']);
      },
      err => {
        this.loginStatus = err.status;
        console.log(this.loginStatus)
      }
    )
  }

}
