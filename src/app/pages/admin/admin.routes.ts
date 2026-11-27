import { Routes } from '@angular/router';
import { CanDeactivateGuard } from '../../components/CanDeactivateGuard';
import { adminSectionGuard } from './admin-access.guard';

/** Login and admin access are checked by the parent route. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-home/admin-home.component').then(m => m.AdminHomeComponent),
  },
  {
    path: 'users',
    canActivate: [adminSectionGuard('users')],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin-users/admin-users.component').then(m => m.AdminUsersComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./admin-users/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent),
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./admin-users/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent),
        canDeactivate: [CanDeactivateGuard],
      },
    ],
  },
  {
    path: 'roles',
    canActivate: [adminSectionGuard('roles')],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin-roles/admin-roles.component').then(m => m.AdminRolesComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./admin-roles/admin-role-form/admin-role-form.component').then(m => m.AdminRoleFormComponent),
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./admin-roles/admin-role-form/admin-role-form.component').then(m => m.AdminRoleFormComponent),
        canDeactivate: [CanDeactivateGuard],
      },
    ],
  },
  {
    path: 'algorithms',
    canActivate: [adminSectionGuard('algorithms')],
    children: [
      {
        path: '',
        loadComponent: () => import('../algorithms/algorithms.component').then(m => m.AlgorithmsComponent),
      },
      {
        path: 'wizard',
        loadComponent: () =>
          import('../algorithms/algorithm-wizard/algorithm-wizard.component').then(m => m.AlgorithmWizardComponent),
        canDeactivate: [CanDeactivateGuard],
      },
      {
        path: 'wizard/:id',
        loadComponent: () =>
          import('../algorithms/algorithm-wizard/algorithm-wizard.component').then(m => m.AlgorithmWizardComponent),
        canDeactivate: [CanDeactivateGuard],
      },
    ],
  },
];
