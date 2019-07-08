import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService, JWTLoginResponse } from '@hyperiot/core';

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

  constructor(private authenticationService: AuthenticationService) { }

  ngOnInit() {
  }

  login() {
    this.authenticationService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      res => {
        this.loginStatus = 200;
        var jwtToken = <JWTLoginResponse>res;
        localStorage.setItem('jwt', jwtToken.token)
      },
      err => {
        this.loginStatus = err.status;
        console.log(this.loginStatus)
      }
    )
  }

}
