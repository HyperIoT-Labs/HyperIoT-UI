import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationComponent } from '../pages/authentication/authentication.component';
import { PasswordResetComponent } from '../pages/authentication/password-reset/password-reset.component';
import { UserActivationComponent } from '../pages/authentication/user-activation/user-activation.component';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { NotFoundComponent } from '../pages/not-found/not-found.component';
import { LoginComponent } from '../pages/authentication/login/login.component';
import { RegistrationComponent } from '../pages/authentication/registration/registration.component';
import { PasswordRecoveryComponent } from '../pages/authentication/password-recovery/password-recovery.component';
import { ProjectWizardComponent } from '../pages/projects/project-wizard/project-wizard.component';
import { ProjectsComponent } from '../pages/projects/projects.component';
import { ProfileComponent } from '../pages/account/profile/profile.component';
import { ProjectDetailComponent } from '../pages/projects/project-detail/project-detail.component';
import { ProjectFormComponent } from '../pages/projects/project-forms/project-form/project-form.component';
import { DeviceFormComponent } from '../pages/projects/project-forms/device-form/device-form.component';
import { PacketFormComponent } from '../pages/projects/project-forms/packet-form/packet-form.component';
import { TagsFormComponent } from '../pages/projects/project-forms/tags-form/tags-form.component';
import { CategoriesFormComponent } from '../pages/projects/project-forms/categories-form/categories-form.component';
import { CanDeactivateGuard } from '../components/CanDeactivateGuard';
import { PacketFieldsFormComponent } from '../pages/projects/project-forms/packet-fields-form/packet-fields-form.component';
import { PacketEnrichmentFormComponent } from '../pages/projects/project-forms/packet-enrichment-form/packet-enrichment-form.component';
import { ProjectEventsFormComponent } from '../pages/projects/project-forms/project-events-form/project-events-form.component';
import { HomeComponent } from '../pages/home/home.component';
import { AreasFormComponent } from '../pages/projects/project-forms/areas-form/areas-form.component';
import { AreasViewComponent } from '../pages/areas/areas-view/areas-view.component';
import { AlgorithmsComponent } from '../pages/algorithms/algorithms.component';
import { AlgorithmWizardComponent } from '../pages/algorithms/algorithm-wizard/algorithm-wizard.component';
import { ProjectStatisticsFormComponent } from '../pages/projects/project-forms/project-statistics-form/project-statistics-form.component';
import { ProjectAlarmsFormComponent } from '../pages/projects/project-forms/project-alarms-form/project-alarms-form.component';
import {DashComponent} from '../pages/dash/dash.component';
import {
  MachineLearningWizardComponent
} from "../pages/machinelearning/machinelearning-wizard/machinelearning-wizard.component";
import {MachineLearningComponent} from "../pages/machinelearning/machinelearning.component";

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


/**
 * This guard checks if user is admin or he has access the permission to do something on a resource
 */
@Injectable()
export class IsProtectedResourceGuard implements CanActivate {

  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean> | Promise<boolean> | boolean {
    if (localStorage.getItem('userInfo')) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      if (userInfo.authenticable.admin ||
        this.hasControlPanelAccess(userInfo.profile, route.data.resourceName, route.data.action)) {
        return true;
      }
    }
    this.router.navigate(['/notFound'], { state: { returnUrl: state.url } });
    return false;
  }

  private hasControlPanelAccess(profile: any, resourceName: string, action: string): boolean {
    if(profile.hasOwnProperty(resourceName)) {
      const permissions: string[] = profile[resourceName].permissions;
      if (permissions.includes(action)) {
        return true;
      }
    }
    return false;
  }

}

const hyperiotRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [LoggedInGuard],
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
    canDeactivate: [CanDeactivateGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'project-wizard/:id',
    component: ProjectWizardComponent,
    canActivate: [LoggedInGuard],
    canDeactivate: [CanDeactivateGuard],
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
        component: PacketFieldsFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'packet-enrichments/:packetId',
        component: PacketEnrichmentFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'statistics',
        component: ProjectStatisticsFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'events',
        component: ProjectEventsFormComponent,
        outlet: 'projectDetails'
      },
{
        canDeactivate: [CanDeactivateGuard],
        path: 'alarms',
        component: ProjectAlarmsFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'tags',
        component: TagsFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'categories',
        component: CategoriesFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'areas',
        component: AreasFormComponent,
        outlet: 'projectDetails'
      },
      {
        canDeactivate: [CanDeactivateGuard],
        path: 'areas/:areaId',
        component: AreasFormComponent,
        outlet: 'projectDetails'
      }
    ],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'dashboards',
    component: DashComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'areas',
    component: AreasViewComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'areas/:projectId',
    component: AreasViewComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'areas/:projectId/:areaId',
    component: AreasViewComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'areas/:projectId/:areaId/dashboards',
    component: DashComponent,
    canActivate: [LoggedInGuard],
    data: {
      showToolBar: true,
    }
  },
  {
    path: 'algorithms',
    component: AlgorithmsComponent,
    canActivate: [LoggedInGuard, IsProtectedResourceGuard],
    data: {
      showToolBar: true,
      resourceName: 'it.acsoftware.hyperiot.algorithm.model.Algorithm',
      action: 'control_panel'
    }
  },
  {
    path: 'algorithm-wizard',
    component: AlgorithmWizardComponent,
    canActivate: [LoggedInGuard, IsProtectedResourceGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {
      showToolBar: true,
      resourceName: 'it.acsoftware.hyperiot.algorithm.model.Algorithm',
      action: 'control_panel'
    }
  },
  {
    path: 'algorithm-wizard/:id',
    component: AlgorithmWizardComponent,
    canActivate: [LoggedInGuard, IsProtectedResourceGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {
      showToolBar: true,
      resourceName: 'it.acsoftware.hyperiot.algorithm.model.Algorithm',
      action: 'control_panel'
    }
  },
  {
    path: 'machinelearning',
    component: MachineLearningComponent,
    canActivate: [LoggedInGuard, IsProtectedResourceGuard],
    data: {
      showToolBar: true,
      resourceName: 'it.acsoftware.hyperiot.algorithm.model.MachineLearning',
      action: 'control_panel'
    }
  },
  {
    path: 'machinelearning-wizard',
    component: MachineLearningWizardComponent,
    canActivate: [LoggedInGuard, IsProtectedResourceGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {
      showToolBar: true,
      resourceName: 'it.acsoftware.hyperiot.algorithm.model.MachineLearning',
      action: 'control_panel'
    }
  },
  {
    path: 'machinelearning-wizard/:id',
    component: MachineLearningWizardComponent,
    canActivate: [LoggedInGuard, IsProtectedResourceGuard],
    canDeactivate: [CanDeactivateGuard],
    data: {
      showToolBar: true,
      resourceName: 'it.acsoftware.hyperiot.algorithm.model.MachineLearning',
      action: 'control_panel'
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
    path: 'notFound',
    component: NotFoundComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(hyperiotRoutes)],
  exports: [RouterModule],
  providers: [LoggedInGuard, IsProtectedResourceGuard, CanDeactivateGuard]
})
export class HytRoutingModule { }
