import { TestBed } from '@angular/core/testing';
import { Permission, PermissionsService, Role, RolesService } from 'core';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AdminRolesService } from './admin-roles.service';
import { ResourceActions } from './role-permissions';

const PROJECT = 'it.acsoftware.hyperiot.hproject.model.HProject';
const DEVICE = 'it.acsoftware.hyperiot.hdevice.model.HDevice';

const resources: ResourceActions[] = [
  { resourceName: DEVICE, shortName: 'HDevice', actions: [{ name: 'find', id: 8 }] },
  { resourceName: PROJECT, shortName: 'HProject', actions: [{ name: 'save', id: 1 }, { name: 'find', id: 8 }] },
];

describe('AdminRolesService', () => {
  let rolesService: Record<'saveRole' | 'updateRole' | 'findRole' | 'findAllRoles', ReturnType<typeof vi.fn>>;
  let permissionsService: Record<
    'savePermission' | 'updatePermission' | 'deletePermission' | 'findAllPermission',
    ReturnType<typeof vi.fn>
  >;
  let service: AdminRolesService;

  beforeEach(() => {
    rolesService = {
      saveRole: vi.fn((role: Role) => of({ ...role, id: 20 })),
      updateRole: vi.fn((role: Role) => of(role)),
      findRole: vi.fn(() => of({ id: 4, entityVersion: 1, name: 'Operator' })),
      findAllRoles: vi.fn(() => of([])),
    };
    permissionsService = {
      savePermission: vi.fn(() => of({})),
      updatePermission: vi.fn(() => of({})),
      deletePermission: vi.fn(() => of({})),
      findAllPermission: vi.fn(() => of([])),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: RolesService, useValue: rolesService },
        { provide: PermissionsService, useValue: permissionsService },
      ],
    });
    service = TestBed.inject(AdminRolesService);
  });

  it('creates the role, then a permission for each resource with actions', async () => {
    const result = await firstValueFrom(
      service.create({ name: ' Operator ', description: 'Ops' }, resources, { [PROJECT]: 9, [DEVICE]: 0 }),
    );

    expect(rolesService.saveRole).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Operator', description: 'Ops', entityVersion: 1 }),
      'body', false, expect.anything(),
    );
    const created = permissionsService.savePermission.mock.calls.map(call => call[0] as Permission);
    expect(created).toEqual([expect.objectContaining({ entityResourceName: PROJECT, actionIds: 9, role: expect.objectContaining({ id: 20 }) })]);
    expect(result).toEqual({ role: expect.objectContaining({ id: 20 }), failedResources: [] });
  });

  it('loads only the role-wide permissions of the role', async () => {
    permissionsService.findAllPermission.mockReturnValue(
      of([
        { id: 1, entityVersion: 1, role: { id: 4, entityVersion: 1 }, entityResourceName: PROJECT, resourceId: 0, actionIds: 9 },
        { id: 2, entityVersion: 1, role: { id: 5, entityVersion: 1 }, entityResourceName: DEVICE, resourceId: 0, actionIds: 8 },
      ]),
    );
    const data = await firstValueFrom(service.findForEdit(4));
    expect([...data.permissions.keys()]).toEqual([PROJECT]);
  });

  it('updates the role and changes only the modified permissions', async () => {
    const original: Role = { id: 4, entityVersion: 3, name: 'Operator', description: 'Old' };
    const existing = new Map<string, Permission>([
      [PROJECT, { id: 1, entityVersion: 1, role: original, entityResourceName: PROJECT, resourceId: 0, actionIds: 9 }],
      [DEVICE, { id: 2, entityVersion: 1, role: original, entityResourceName: DEVICE, resourceId: 0, actionIds: 8 }],
    ]);

    await firstValueFrom(
      service.update(original, existing, { name: 'Operator', description: 'New' }, resources, { [PROJECT]: 1, [DEVICE]: 8 }),
    );

    expect(rolesService.updateRole).toHaveBeenCalledWith(
      expect.objectContaining({ id: 4, entityVersion: 3, description: 'New' }),
      'body', false, expect.anything(),
    );
    expect(permissionsService.updatePermission.mock.calls.map(call => (call[0] as Permission).actionIds)).toEqual([1]);
    expect(permissionsService.savePermission).not.toHaveBeenCalled();
    expect(permissionsService.deletePermission).not.toHaveBeenCalled();
  });

  it('reports the permissions that could not be saved without failing the save', async () => {
    permissionsService.savePermission.mockReturnValue(throwError(() => new Error('forbidden')));
    const result = await firstValueFrom(service.create({ name: 'Operator', description: '' }, resources, { [DEVICE]: 8 }));
    expect(result.failedResources).toEqual([DEVICE]);
  });

  it('does not touch permissions when the role save fails', async () => {
    rolesService.saveRole.mockReturnValue(throwError(() => new Error('duplicate')));
    await expect(firstValueFrom(service.create({ name: 'Operator', description: '' }, resources, { [DEVICE]: 8 }))).rejects.toThrow(
      'duplicate',
    );
    expect(permissionsService.savePermission).not.toHaveBeenCalled();
  });
});
