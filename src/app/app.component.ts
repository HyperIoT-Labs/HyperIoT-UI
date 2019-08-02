import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'hyt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  constructor(private route: Router, private cookieService: CookieService) { }

  showToolBar(): boolean {
    return (this.route.routerState.snapshot.root.children[0] != undefined) ? this.route.routerState.snapshot.root.children[0].data.showToolBar : true;
  }

  logout() {
    this.cookieService.delete('HIT-AUTH', '/');
    this.route.navigate(['/auth/login']);
  }

}
