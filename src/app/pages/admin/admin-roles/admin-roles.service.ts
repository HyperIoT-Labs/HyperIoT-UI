import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { IGNORE_ERROR_NOTIFY, Permission, PermissionsService, Role, RolesService } from 'core';
import {
  PermissionMasks,
  ResourceActions,
  buildResources,
  planPermissionChanges,
  rolePermissions,
} from './role-permissions';

export interface RoleFormValue {
  name: string;
  description: string;
}

export interface RoleEditData {
  role: Role;
  /** Role-wide only. */
  permissions: Map<string, Permission>;
}

/** Permissions are saved after the role, so some can fail. */
export interface RoleSaveResult {
  role: Role;
  failedResources: string[];
}

/** The pages show their own errors: no interceptor toast. */
function silentContext(): HttpContext {
  return new HttpContext().set(IGNORE_ERROR_NOTIFY, true);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

@Injectable({ providedIn: 'root' })
export class AdminRolesService {
  private readonly rolesService = inject(RolesService);
  private readonly permissionsService = inject(PermissionsService);

  findAll(): Observable<Role[]> {
    return this.rolesService.findAllRoles('body', false, silentContext()).pipe(map(roles => asArray<Role>(roles)));
  }

  findResources(): Observable<ResourceActions[]> {
    return this.permissionsService.findAllActions('body', false, silentContext()).pipe(map(buildResources));
  }

  findForEdit(id: number): Observable<RoleEditData> {
    return forkJoin({
      role: this.rolesService.findRole(id, 'body', false, silentContext()) as Observable<Role>,
      // there is no endpoint for the permissions of one role
      permissions: this.permissionsService
        .findAllPermission('body', false, silentContext())
        .pipe(map(permissions => rolePermissions(asArray<Permission>(permissions), id))),
    });
  }

  create(value: RoleFormValue, resources: ResourceActions[], masks: PermissionMasks): Observable<RoleSaveResult> {
    const role: Role = { entityVersion: 1, ...this.roleFields(value) };
    return (this.rolesService.saveRole(role, 'body', false, silentContext()) as Observable<Role>).pipe(
      switchMap(saved => this.applyPermissions(saved, resources, new Map(), masks)),
    );
  }

  update(
    original: Role,
    permissions: Map<string, Permission>,
    value: RoleFormValue,
    resources: ResourceActions[],
    masks: PermissionMasks,
  ): Observable<RoleSaveResult> {
    const role: Role = { ...original, ...this.roleFields(value) };
    return (this.rolesService.updateRole(role, 'body', false, silentContext()) as Observable<Role>).pipe(
      switchMap(saved => this.applyPermissions(saved, resources, permissions, masks)),
    );
  }

  delete(id: number): Observable<void> {
    return this.rolesService.deleteRole(id).pipe(map(() => undefined));
  }

  private roleFields(value: RoleFormValue): Pick<Role, 'name' | 'description'> {
    return { name: value.name.trim(), description: value.description.trim() };
  }

  /** A failed call does not stop the others. */
  private applyPermissions(
    role: Role,
    resources: ResourceActions[],
    existing: Map<string, Permission>,
    masks: PermissionMasks,
  ): Observable<RoleSaveResult> {
    if (role.id === undefined) {
      return of({ role, failedResources: Object.keys(masks).filter(name => masks[name] !== 0) });
    }
    const changes = planPermissionChanges(resources, existing, masks, role);
    const calls: { resourceName: string; call: Observable<unknown> }[] = [
      ...changes.create.map(permission => ({
        resourceName: permission.entityResourceName ?? '',
        call: this.permissionsService.savePermission(permission, 'body', false, silentContext()),
      })),
      ...changes.update.map(permission => ({
        resourceName: permission.entityResourceName ?? '',
        call: this.permissionsService.updatePermission(permission, 'body', false, silentContext()),
      })),
      ...changes.remove
        .filter((permission): permission is Permission & { id: number } => permission.id !== undefined)
        .map(permission => ({
          resourceName: permission.entityResourceName ?? '',
          call: this.permissionsService.deletePermission(permission.id, 'body', false, silentContext()),
        })),
    ];
    if (calls.length === 0) {
      return of({ role, failedResources: [] });
    }
    return forkJoin(
      calls.map(({ resourceName, call }) =>
        call.pipe(
          map(() => null),
          catchError(() => of(resourceName)),
        ),
      ),
    ).pipe(map(results => ({ role, failedResources: results.filter((name): name is string => name !== null) })));
  }
}
