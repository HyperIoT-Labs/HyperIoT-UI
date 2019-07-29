import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationComponent } from '../pages/authentication/authentication.component';
import { PasswordResetComponent } from '../pages/password-reset/password-reset.component';
import { UserActivationComponent } from '../pages/user-activation/user-activation.component';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';

@Injectable()
export class LoggedInGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    if (this.cookieService.check('HIT-AUTH')) {
      return true;
    }
    this.router.navigate(['/authentication'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}

const hyperiotRoutes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard/demo',
    pathMatch: "full"
  },
  {
    path: 'authentication',
    component: AuthenticationComponent,
    data: {
      showToolBar: false,
    }
  },
  {
    path: 'activation/:email/:code',
    component: UserActivationComponent,
    data: {
      showToolBar: false,
    }
  },
  {
    path: 'passwordReset/:email/:code',
    component: PasswordResetComponent,
    data: {
      showToolBar: false,
    }
  },
  {
    path: 'dashboard/:id',
    component: DashboardComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: '**',
    redirectTo: 'authentication'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(hyperiotRoutes)],
  exports: [RouterModule],
  providers: [LoggedInGuard]
})
export class HytRoutingModule { }
