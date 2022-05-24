import { Component, OnInit } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'hyt-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent implements OnInit {
  idProjectSelected = 0;

  constructor(private cookieService: CookieService) { }

  ngOnInit(): void {
    const user = JSON.parse(this.cookieService.get('user'));
    this.idProjectSelected = user?.id === 502 ? 503 : 425;
    console.log(user);
    // this.idProjectSelected = 425;
  }

}
