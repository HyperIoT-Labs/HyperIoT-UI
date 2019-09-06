import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'hyt-account-button',
  templateUrl: './account-button.component.html',
  styleUrls: ['./account-button.component.scss']
})
export class AccountButtonComponent implements OnInit {

  isLoggedIn: boolean = true;

  constructor(
    private route: Router,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
  }

  logout() {
    this.cookieService.delete('HIT-AUTH', '/');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    this.route.navigate(['/auth/login']);
  }

}
