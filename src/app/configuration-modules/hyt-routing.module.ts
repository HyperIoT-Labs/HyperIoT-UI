import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { AuthenticationComponent } from '../pages/authentication/authentication.component';
import { PasswordResetComponent } from '../pages/authentication/password-reset/password-reset.component';
import { UserActivationComponent } from '../pages/authentication/user-activation/user-activation.component';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { LoginComponent } from '../pages/authentication/login/login.component';
import { RegistrationComponent } from '../pages/authentication/registration/registration.component';
import { PasswordRecoveryComponent } from '../pages/authentication/password-recovery/password-recovery.component';
import { ProjectWizardComponent, ProjectWizardCanDeactivate } from '../pages/projects/project-wizard/project-wizard.component';
import { ProjectsComponent } from '../pages/projects/projects.component';
import { ProfileComponent } from '../pages/account/profile/profile.component';
import { ProjectDetailComponent } from '../pages/projects/project-detail/project-detail.component';
import { ProjectFormComponent } from '../pages/projects/project-forms/project-form/project-form.component';
import { DeviceFormComponent } from '../pages/projects/project-forms/device-form/device-form.component';
import { PacketFormComponent } from '../pages/projects/project-forms/packet-form/packet-form.component';
import { CanDeactivateGuard } from '../components/CanDeactivateGuard';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { PacketFieldsDataComponent } from '../pages/projects/project-forms/packet-fields-data/packet-fields-data.component';
import { PacketEnrichmentsDataComponent } from '../pages/projects/project-forms/packet-enrichments-data/packet-enrichments-data.component';
import { PacketStatisticsDataComponent } from '../pages/projects/project-forms/packet-statistics-data/packet-statistics-data.component';
import { PacketEventsDataComponent } from '../pages/projects/project-forms/packet-events-data/packet-events-data.component';
import { HomeComponent } from '../pages/home/home.component';

@Injectable()
export class LoggedInGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    if (this.cookieService.check('HIT-AUTH') && localStorage.getItem('user') && localStorage.getItem('userInfo')) {
      return true;
    }
    this.router.navigate(['/auth/login'], { state: { returnUrl: state.url } });
    return false;
  }

}

// {
//   path: '',
//   redirectTo: 'dashboards',
//   pathMatch: 'full'
// }

const hyperiotRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      showToolBar: true
    }
  },
  {
    path: 'auth',
    component: AuthenticationComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'registration',
        component: RegistrationComponent
      },
      {
        path: 'password-recovery',
        component: PasswordRecoveryComponent
      },
      {
        path: 'password-reset/:email/:code',
        component: PasswordResetComponent
      },
      {
        path: 'activation/:email/:code',
        component: UserActivationComponent
      }
    ],
    data: {
      showToolBar: false,
    }
  },
  {
    path: 'login',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'project-wizard',
    component: ProjectWizardComponent,
    canActivate: [LoggedInGuard],
    canDeactivate: [ProjectWizardCanDeactivate],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'projects/:projectId',
    component: ProjectDetailComponent,
    canActivate: [LoggedInGuard],
    children: [
      {
        canDeactivate: [CanDeactivateGuard],
        path: '',
        component: ProjectFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'device/:deviceId',
        component: DeviceFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'packet/:packetId',
        component: PacketFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'packet-fields/:packetId',
        component: PacketFieldsDataComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'packet-enrichments/:packetId',
        component: PacketEnrichmentsDataComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'packet-statistics/:packetId',
        component: PacketStatisticsDataComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'packet-events/:packetId',
        component: PacketEventsDataComponent,
        outlet: 'projectDetails'
      }
    ],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'dashboards',
    component: DashboardComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'account/profile',
    component: ProfileComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true
    }
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(hyperiotRoutes)],
  exports: [RouterModule],
  providers: [LoggedInGuard, CanDeactivateGuard]
})
export class HytRoutingModule { }
