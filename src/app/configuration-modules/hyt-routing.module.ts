import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthenticationComponent } from '../pages/authentication/authentication.component';
import { PasswordResetComponent } from '../pages/password-reset/password-reset.component';
import { UserActivationComponent } from '../pages/user-activation/user-activation.component';

const hyperiotRoutes: Routes = [
  {
    path: '',
    redirectTo: 'authentication',
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
    path: '**',
    redirectTo: 'authentication'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(hyperiotRoutes)],
  exports: [RouterModule]
})
export class HytRoutingModule { }
