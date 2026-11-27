import { Injectable } from '@angular/core';

export type AdminSectionId = 'users' | 'roles' | 'algorithms';

export const ADMIN_SECTION_IDS: readonly AdminSectionId[] = ['users', 'roles', 'algorithms'];

/** Non-admins need this action on the resource (users and roles have no `control_panel`). */
export const ADMIN_SECTION_PERMISSIONS: Readonly<Record<AdminSectionId, { resource: string; action: string }>> = {
  users: { resource: 'it.acsoftware.hyperiot.huser.model.HUser', action: 'find-all' },
  roles: { resource: 'it.acsoftware.hyperiot.role.model.Role', action: 'find-all' },
  algorithms: { resource: 'it.acsoftware.hyperiot.algorithm.model.Algorithm', action: 'control_panel' },
};

interface StoredUserInfo {
  authenticable?: { admin?: boolean };
  profile?: Record<string, { permissions?: string[] } | undefined>;
}

/** From `userInfo` in localStorage. */
@Injectable({ providedIn: 'root' })
export class AdminAccessService {

  canAccessSection(section: AdminSectionId): boolean {
    const userInfo = this.readUserInfo();
    if (!userInfo) {
      return false;
    }
    if (userInfo.authenticable?.admin) {
      return true;
    }
    const { resource, action } = ADMIN_SECTION_PERMISSIONS[section];
    const permissions = userInfo.profile?.[resource]?.permissions ?? [];
    return permissions.includes(action);
  }

  accessibleSections(): AdminSectionId[] {
    return ADMIN_SECTION_IDS.filter(section => this.canAccessSection(section));
  }

  canAccessAdminArea(): boolean {
    return this.accessibleSections().length > 0;
  }

  private readUserInfo(): StoredUserInfo | null {
    const raw = localStorage.getItem('userInfo');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredUserInfo;
    } catch {
      return null;
    }
  }
}
