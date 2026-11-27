import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAccessService, AdminSectionId } from './admin-access.service';

export const adminAreaGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AdminAccessService).canAccessAdminArea() || router.createUrlTree(['/notFound']);
};

export function adminSectionGuard(section: AdminSectionId): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(AdminAccessService).canAccessSection(section) || router.createUrlTree(['/notFound']);
  };
}
