import { Permission, Role } from 'core';

export interface ResourceAction {
  name: string;
  /** Bit in the permission mask (1, 2, 4, ...). */
  id: number;
}

export interface ResourceActions {
  /** Fully qualified name, e.g. `it.acsoftware.hyperiot.hproject.model.HProject`. */
  resourceName: string;
  /** Last part of the name, e.g. `HProject`. */
  shortName: string;
  /** Sorted by bit value. */
  actions: ResourceAction[];
}

/** Action mask by resource name. */
export type PermissionMasks = Record<string, number>;

interface ActionResponseItem {
  actionName?: string;
  actionId?: number;
}

export function shortResourceName(resourceName: string): string {
  return resourceName.split('.').pop() ?? resourceName;
}

/** Resources sorted by short name, actions by value. */
export function buildResources(response: unknown): ResourceActions[] {
  if (!response || typeof response !== 'object') {
    return [];
  }
  return Object.entries(response as Record<string, unknown>)
    .map(([resourceName, items]) => ({
      resourceName,
      shortName: shortResourceName(resourceName),
      actions: (Array.isArray(items) ? (items as ActionResponseItem[]) : [])
        .filter((item): item is Required<ActionResponseItem> =>
          typeof item.actionName === 'string' && typeof item.actionId === 'number')
        .map(item => ({ name: item.actionName, id: item.actionId }))
        .sort((a, b) => a.id - b.id),
    }))
    .filter(resource => resource.actions.length > 0)
    .sort((a, b) => a.shortName.localeCompare(b.shortName));
}

/** Role-wide permissions by resource name: per-user and per-entity ones are not part of the role. */
export function rolePermissions(permissions: readonly Permission[], roleId: number): Map<string, Permission> {
  const byResource = new Map<string, Permission>();
  for (const permission of permissions) {
    if (
      permission.role?.id === roleId &&
      !permission.huser &&
      !permission.resourceId &&
      permission.entityResourceName
    ) {
      byResource.set(permission.entityResourceName, permission);
    }
  }
  return byResource;
}

export function masksOf(permissions: ReadonlyMap<string, Permission>): PermissionMasks {
  const masks: PermissionMasks = {};
  permissions.forEach((permission, resourceName) => (masks[resourceName] = permission.actionIds ?? 0));
  return masks;
}

export function hasAction(mask: number, actionId: number): boolean {
  return (mask & actionId) === actionId;
}

export function withAction(mask: number, actionId: number, granted: boolean): number {
  return granted ? mask | actionId : mask & ~actionId;
}

export function allActionsMask(actions: readonly ResourceAction[]): number {
  return actions.reduce((mask, action) => mask | action.id, 0);
}

export function grantedCount(mask: number, actions: readonly ResourceAction[]): number {
  return actions.filter(action => hasAction(mask, action.id)).length;
}

export interface PermissionChanges {
  create: Permission[];
  update: Permission[];
  remove: Permission[];
}

/** Bits of actions the UI does not list are kept as they are. */
export function planPermissionChanges(
  resources: readonly ResourceActions[],
  existing: ReadonlyMap<string, Permission>,
  masks: PermissionMasks,
  role: Role,
): PermissionChanges {
  const changes: PermissionChanges = { create: [], update: [], remove: [] };
  for (const resource of resources) {
    const known = allActionsMask(resource.actions);
    const current = existing.get(resource.resourceName);
    const currentMask = current?.actionIds ?? 0;
    const wanted = (currentMask & ~known) | ((masks[resource.resourceName] ?? 0) & known);

    if (current) {
      if (wanted === 0) {
        changes.remove.push(current);
      } else if (wanted !== currentMask) {
        changes.update.push({ ...current, actionIds: wanted });
      }
    } else if (wanted !== 0) {
      changes.create.push({
        entityVersion: 1,
        name: `${resource.resourceName} ${role.name ?? ''} Permissions`.replace(/\s+/g, ' '),
        actionIds: wanted,
        entityResourceName: resource.resourceName,
        resourceId: 0,
        role: { id: role.id, entityVersion: role.entityVersion, name: role.name, description: role.description },
      });
    }
  }
  return changes;
}

export function hasPermissionChanges(changes: PermissionChanges): boolean {
  return changes.create.length + changes.update.length + changes.remove.length > 0;
}
