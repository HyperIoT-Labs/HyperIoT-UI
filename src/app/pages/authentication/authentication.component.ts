import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { AuthType } from './models/pageStatus'

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit {

  authType: AuthType;

  email: string = '';

  constructor() { }

  ngOnInit() {
    this.authType = AuthType.Login;
  }

}
