import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { BrandingActions } from 'src/app/state/branding/branding.actions';
import { PostLoginService } from 'src/app/services/postLogin/post-login.service';

@Component({
  selector: 'hyt-account-button',
  templateUrl: './account-button.component.html',
  styleUrls: ['./account-button.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountButtonComponent implements OnInit {

  isLoggedIn = true;

  constructor(
    private route: Router,
    private cookieService: CookieService,
    private postLoginService: PostLoginService
  ) { }

  ngOnInit() {
  }

  logout() {
    this.cookieService.delete('HIT-AUTH', '/');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    this.postLoginService.actionsAtLogout();
    this.route.navigate(['/auth/login']);
    
  }

}
