import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fadeAnimation } from '../../route-animation';

@Component({
  selector: 'hyt-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [fadeAnimation]
})
export class AuthenticationComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
