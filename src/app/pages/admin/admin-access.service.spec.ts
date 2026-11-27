import { TestBed } from '@angular/core/testing';
import { ADMIN_SECTION_PERMISSIONS, AdminAccessService } from './admin-access.service';

function setUserInfo(userInfo: unknown): void {
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

describe('AdminAccessService', () => {
  let service: AdminAccessService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(AdminAccessService);
  });

  afterEach(() => localStorage.clear());

  it('denies everything without userInfo', () => {
    expect(service.canAccessAdminArea()).toBe(false);
    expect(service.accessibleSections()).toEqual([]);
  });

  it('denies everything when userInfo is not valid JSON', () => {
    localStorage.setItem('userInfo', '{not json');
    expect(service.canAccessAdminArea()).toBe(false);
  });

  it('gives an admin access to every section', () => {
    setUserInfo({ authenticable: { admin: true }, profile: {} });
    expect(service.accessibleSections()).toEqual(['users', 'roles', 'algorithms']);
    expect(service.canAccessAdminArea()).toBe(true);
  });

  it('gives a non-admin only the sections with the required permission', () => {
    setUserInfo({
      authenticable: { admin: false },
      profile: {
        [ADMIN_SECTION_PERMISSIONS.algorithms.resource]: { permissions: ['control_panel'] },
        [ADMIN_SECTION_PERMISSIONS.users.resource]: { permissions: ['find'] },
      },
    });
    expect(service.accessibleSections()).toEqual(['algorithms']);
    expect(service.canAccessSection('users')).toBe(false);
    expect(service.canAccessAdminArea()).toBe(true);
  });

  it('gives a non-admin the users and roles sections with the find-all permission', () => {
    setUserInfo({
      authenticable: { admin: false },
      profile: {
        [ADMIN_SECTION_PERMISSIONS.users.resource]: { permissions: ['find', 'find-all'] },
        [ADMIN_SECTION_PERMISSIONS.roles.resource]: { permissions: ['find-all'] },
      },
    });
    expect(service.accessibleSections()).toEqual(['users', 'roles']);
  });

  it('denies the admin area to a non-admin without the required permissions', () => {
    setUserInfo({ authenticable: { admin: false }, profile: {} });
    expect(service.canAccessAdminArea()).toBe(false);
  });
});
