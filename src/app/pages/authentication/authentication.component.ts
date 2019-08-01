import { Component, OnInit } from '@angular/core';
import { fadeAnimation } from '../../route-animation';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  animations: [fadeAnimation]
})
export class AuthenticationComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
