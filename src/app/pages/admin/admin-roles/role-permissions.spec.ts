import { Permission, Role } from 'core';
import {
  ResourceActions,
  buildResources,
  grantedCount,
  hasAction,
  masksOf,
  planPermissionChanges,
  rolePermissions,
  withAction,
} from './role-permissions';

const PROJECT = 'it.acsoftware.hyperiot.hproject.model.HProject';
const DEVICE = 'it.acsoftware.hyperiot.hdevice.model.HDevice';

const role: Role = { id: 4, entityVersion: 1, name: 'Operator', description: 'Operators' };

const resources: ResourceActions[] = [
  { resourceName: DEVICE, shortName: 'HDevice', actions: [{ name: 'save', id: 1 }, { name: 'find', id: 8 }] },
  { resourceName: PROJECT, shortName: 'HProject', actions: [{ name: 'save', id: 1 }, { name: 'update', id: 2 }, { name: 'find', id: 8 }] },
];

function permission(fields: Partial<Permission>): Permission {
  return { entityVersion: 1, resourceId: 0, ...fields };
}

describe('buildResources', () => {
  it('sorts resources by short name and actions by value, skipping malformed items', () => {
    const result = buildResources({
      [PROJECT]: [
        { actionName: 'find', actionId: 8 },
        { actionName: 'save', actionId: 1 },
        { actionName: 'broken' },
      ],
      [DEVICE]: [{ actionName: 'save', actionId: 1 }],
      'it.acsoftware.Empty': [],
    });
    expect(result.map(r => r.shortName)).toEqual(['HDevice', 'HProject']);
    expect(result[1].actions).toEqual([{ name: 'save', id: 1 }, { name: 'find', id: 8 }]);
  });

  it('returns no resources for an unexpected response', () => {
    expect(buildResources(null)).toEqual([]);
    expect(buildResources('error')).toEqual([]);
  });
});

describe('rolePermissions', () => {
  it('keeps only the role-wide permissions of the role', () => {
    const own = permission({ id: 1, role, entityResourceName: PROJECT, actionIds: 9 });
    const result = rolePermissions(
      [
        own,
        permission({ id: 2, role: { id: 99, entityVersion: 1 }, entityResourceName: DEVICE, actionIds: 1 }),
        permission({ id: 3, huser: { id: 7, entityVersion: 1 }, entityResourceName: PROJECT, resourceId: 252 }),
        permission({ id: 4, role, entityResourceName: DEVICE, resourceId: 12, actionIds: 1 }),
      ],
      4,
    );
    expect([...result.entries()]).toEqual([[PROJECT, own]]);
  });
});

describe('mask helpers', () => {
  it('reads and changes single actions', () => {
    expect(hasAction(9, 8)).toBe(true);
    expect(hasAction(9, 2)).toBe(false);
    expect(withAction(9, 2, true)).toBe(11);
    expect(withAction(9, 8, false)).toBe(1);
    expect(grantedCount(11, resources[1].actions)).toBe(3);
  });

  it('builds the masks of the existing permissions', () => {
    const existing = new Map([[PROJECT, permission({ entityResourceName: PROJECT, actionIds: 9 })]]);
    expect(masksOf(existing)).toEqual({ [PROJECT]: 9 });
  });
});

describe('planPermissionChanges', () => {
  it('creates, updates and removes only what changed', () => {
    const projectPermission = permission({ id: 1, role, entityResourceName: PROJECT, actionIds: 9 });
    const devicePermission = permission({ id: 2, role, entityResourceName: DEVICE, actionIds: 1 });
    const existing = new Map([
      [PROJECT, projectPermission],
      [DEVICE, devicePermission],
    ]);

    const unchanged = planPermissionChanges(resources, existing, { [PROJECT]: 9, [DEVICE]: 1 }, role);
    expect(unchanged).toEqual({ create: [], update: [], remove: [] });

    const changes = planPermissionChanges(resources, existing, { [PROJECT]: 11, [DEVICE]: 0 }, role);
    expect(changes.update).toEqual([{ ...projectPermission, actionIds: 11 }]);
    expect(changes.remove).toEqual([devicePermission]);
    expect(changes.create).toEqual([]);
  });

  it('creates a role-wide permission for a resource that had none', () => {
    const changes = planPermissionChanges(resources, new Map(), { [DEVICE]: 8 }, role);
    expect(changes.create).toEqual([
      expect.objectContaining({
        entityResourceName: DEVICE,
        actionIds: 8,
        resourceId: 0,
        name: `${DEVICE} Operator Permissions`,
        role: expect.objectContaining({ id: 4 }),
      }),
    ]);
  });

  it('keeps the bits of actions the UI does not list', () => {
    // 64 is not an action of HProject in the list
    const existing = new Map([[PROJECT, permission({ id: 1, role, entityResourceName: PROJECT, actionIds: 64 | 1 })]]);
    const changes = planPermissionChanges(resources, existing, { [PROJECT]: 0 }, role);
    expect(changes.remove).toEqual([]);
    expect(changes.update).toEqual([expect.objectContaining({ actionIds: 64 })]);
  });
});
