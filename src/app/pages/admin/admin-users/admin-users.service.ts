import { HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { HUser, HUserService, IGNORE_ERROR_NOTIFY, Role, RolesService } from 'core';

/** Password fields are used only when creating. */
export interface UserFormValue {
  username: string;
  name: string;
  lastname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  roleIds: number[];
}

export interface UserWithRoles {
  user: HUser;
  roles: Role[];
}

/** Roles are saved after the user, so some can fail. */
export interface UserSaveResult {
  user: HUser;
  failedRoleIds: number[];
}

/** The page shows its own errors: no interceptor toast. */
function silentContext(): HttpContext {
  return new HttpContext().set(IGNORE_ERROR_NOTIFY, true);
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private readonly hUserService = inject(HUserService);
  private readonly rolesService = inject(RolesService);

  findAll(): Observable<HUser[]> {
    return this.hUserService.findAllHUser('body', false, silentContext()).pipe(
      map((users: unknown) => (Array.isArray(users) ? (users as HUser[]) : [])),
    );
  }

  findWithRoles(id: number): Observable<UserWithRoles> {
    return forkJoin({
      user: this.hUserService.findHUser(id, 'body', false, silentContext()) as Observable<HUser>,
      roles: this.rolesService.findAllUserRoles(id, 'body', false, silentContext()).pipe(
        map((roles: unknown) => (Array.isArray(roles) ? (roles as Role[]) : [])),
      ),
    });
  }

  create(value: UserFormValue): Observable<UserSaveResult> {
    const user: HUser = {
      entityVersion: 1,
      ...this.userFields(value),
      password: value.password,
      passwordConfirm: value.passwordConfirm,
    };
    return (this.hUserService.saveHUser(user, 'body', false, silentContext()) as Observable<HUser>).pipe(
      switchMap(saved => this.applyRoles(saved, [], value.roleIds)),
    );
  }

  /**
   * Starts from the loaded user to keep the fields the form does not show.
   * `active` is always true: the backend disables the user when it is missing.
   */
  update(original: HUser, originalRoleIds: number[], value: UserFormValue): Observable<UserSaveResult> {
    const user: HUser = { ...original, ...this.userFields(value), active: true };
    return (this.hUserService.updateHUser(user, 'body', false, silentContext()) as Observable<HUser>).pipe(
      switchMap(saved => this.applyRoles(saved, originalRoleIds, value.roleIds)),
    );
  }

  delete(id: number): Observable<void> {
    return this.hUserService.deleteHUser(id).pipe(map(() => undefined));
  }

  currentUserId(): number | null {
    const raw = localStorage.getItem('user');
    if (!raw) {
      return null;
    }
    try {
      const id = (JSON.parse(raw) as { id?: unknown }).id;
      return typeof id === 'number' ? id : null;
    } catch {
      return null;
    }
  }

  private userFields(value: UserFormValue): Partial<HUser> {
    return {
      username: value.username.trim(),
      name: value.name.trim(),
      lastname: value.lastname.trim(),
      email: value.email.trim(),
    };
  }

  /** A failed change does not stop the others. */
  private applyRoles(user: HUser, currentIds: number[], wantedIds: number[]): Observable<UserSaveResult> {
    const userId = user.id;
    if (userId === undefined) {
      return of({ user, failedRoleIds: [...wantedIds] });
    }
    const changes = [
      ...wantedIds
        .filter(id => !currentIds.includes(id))
        .map(roleId => ({ roleId, call: this.rolesService.saveUserRole(roleId, userId, 'body', false, silentContext()) })),
      ...currentIds
        .filter(id => !wantedIds.includes(id))
        .map(roleId => ({ roleId, call: this.rolesService.deleteUserRole(roleId, userId, 'body', false, silentContext()) })),
    ];
    if (changes.length === 0) {
      return of({ user, failedRoleIds: [] });
    }
    return forkJoin(
      changes.map(({ roleId, call }) =>
        (call as Observable<unknown>).pipe(
          map(() => null),
          catchError(() => of(roleId)),
        ),
      ),
    ).pipe(map(results => ({ user, failedRoleIds: results.filter((id): id is number => id !== null) })));
  }
}
