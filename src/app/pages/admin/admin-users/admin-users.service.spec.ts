import { TestBed } from '@angular/core/testing';
import { HUser, HUserService, RolesService } from 'core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AdminUsersService, UserFormValue } from './admin-users.service';

// Fake value that meets the password rules, not a real credential.
const RULE_COMPLIANT_VALUE = 'Secret#2026';

const formValue: UserFormValue = {
  username: ' mrossi ',
  name: 'Mario',
  lastname: 'Rossi',
  email: 'mario@example.com',
  password: RULE_COMPLIANT_VALUE,
  passwordConfirm: RULE_COMPLIANT_VALUE,
  roleIds: [4, 5],
};

describe('AdminUsersService', () => {
  let hUserService: { saveHUser: ReturnType<typeof vi.fn>; updateHUser: ReturnType<typeof vi.fn> };
  let rolesService: { saveUserRole: ReturnType<typeof vi.fn>; deleteUserRole: ReturnType<typeof vi.fn> };
  let service: AdminUsersService;

  beforeEach(() => {
    hUserService = {
      saveHUser: vi.fn((user: HUser) => of({ ...user, id: 10 })),
      updateHUser: vi.fn((user: HUser) => of(user)),
    };
    rolesService = {
      saveUserRole: vi.fn(() => of({})),
      deleteUserRole: vi.fn(() => of({})),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: HUserService, useValue: hUserService },
        { provide: RolesService, useValue: rolesService },
      ],
    });
    service = TestBed.inject(AdminUsersService);
  });

  it('creates the user with trimmed fields and password, then assigns its roles', async () => {
    const result = await firstValueFrom(service.create(formValue));

    const sent = hUserService.saveHUser.mock.calls[0][0] as HUser;
    expect(sent).toMatchObject({ username: 'mrossi', password: RULE_COMPLIANT_VALUE, entityVersion: 1 });
    expect(sent).not.toHaveProperty('active');
    expect(sent).not.toHaveProperty('admin');
    expect(rolesService.saveUserRole.mock.calls.map(call => [call[0], call[1]])).toEqual([[4, 10], [5, 10]]);
    expect(result).toEqual({ user: expect.objectContaining({ id: 10 }), failedRoleIds: [] });
  });

  it('updates from the loaded user, keeping "admin", always active and without password', async () => {
    const original: HUser = { id: 7, entityVersion: 3, username: 'old', name: 'Old', lastname: 'Name', email: 'old@example.com', admin: true };
    await firstValueFrom(service.update(original, [4], formValue));

    const sent = hUserService.updateHUser.mock.calls[0][0] as HUser;
    expect(sent).toMatchObject({ id: 7, entityVersion: 3, username: 'mrossi', email: 'mario@example.com', admin: true, active: true });
    expect(sent).not.toHaveProperty('password');
  });

  it('adds only the new roles and removes only the dropped ones', async () => {
    const original: HUser = { id: 7, entityVersion: 1 };
    await firstValueFrom(service.update(original, [3, 4], { ...formValue, roleIds: [4, 5] }));

    expect(rolesService.saveUserRole.mock.calls.map(call => call[0])).toEqual([5]);
    expect(rolesService.deleteUserRole.mock.calls.map(call => call[0])).toEqual([3]);
  });

  it('reports the roles that could not be changed without failing the save', async () => {
    rolesService.saveUserRole.mockImplementation((roleId: number) =>
      roleId === 5 ? throwError(() => new Error('forbidden')) : of({}),
    );
    const result = await firstValueFrom(service.create(formValue));
    expect(result.failedRoleIds).toEqual([5]);
  });

  it('propagates an error of the user save', async () => {
    hUserService.saveHUser.mockReturnValue(throwError(() => new Error('duplicate')));
    await expect(firstValueFrom(service.create(formValue))).rejects.toThrow('duplicate');
    expect(rolesService.saveUserRole).not.toHaveBeenCalled();
  });
});
