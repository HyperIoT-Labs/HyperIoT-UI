import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DialogService } from 'components';
import { HUser, Role } from 'core';
import { ToastrService } from 'ngx-toastr';
import { Observable, forkJoin, of } from 'rxjs';
import { openAdminConfirmDialog } from '../../admin-confirm-dialog/admin-confirm-dialog.component';
import { AdminPageHeaderComponent, BreadcrumbItem } from '../../admin-page-header/admin-page-header.component';
import { AdminRolesService } from '../../admin-roles/admin-roles.service';
import { UserFormField, parseUserSaveError } from '../admin-user-errors';
import { userDisplayName } from '../admin-users-list';
import { AdminUsersService, UserFormValue, UserSaveResult } from '../admin-users.service';
import { PASSWORD_MIN_LENGTH, matchesPassword, passwordStrength } from './user-form-validators';

type LoadStatus = 'loading' | 'ready' | 'error';

/** The password is set only when creating a user. */
@Component({
  selector: 'hyt-admin-user-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    AdminPageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-user-form.component.html',
  styleUrl: './admin-user-form.component.scss',
})
export class AdminUserFormComponent {
  private readonly usersService = inject(AdminUsersService);
  private readonly rolesService = inject(AdminRolesService);
  private readonly dialogService = inject(DialogService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly rawId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly isNew = this.rawId === null;
  /** `null` when creating or with an invalid id. */
  protected readonly userId = this.parseId(this.rawId);
  protected readonly passwordMinLength = PASSWORD_MIN_LENGTH;

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly saving = signal(false);
  protected readonly generalErrors = signal<string[]>([]);
  protected readonly allRoles = signal<Role[]>([]);
  protected readonly hidePassword = signal(true);
  private readonly original = signal<HUser | null>(null);
  private originalRoleIds: number[] = [];
  /** After a save, leaving does not ask to discard changes. */
  private saved = false;

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', [Validators.required, Validators.maxLength(255)]],
    name: ['', [Validators.required, Validators.maxLength(255)]],
    lastname: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    password: ['', [Validators.required, passwordStrength]],
    passwordConfirm: ['', [Validators.required, matchesPassword]],
    roleIds: [[] as number[]],
  });

  protected readonly title = this.isNew
    ? $localize`:@@HYT_admin_user_new:New user`
    : $localize`:@@HYT_admin_user_edit:Edit user`;

  protected readonly breadcrumb = computed<BreadcrumbItem[]>(() => {
    const user = this.original();
    return [
      { label: $localize`:@@HYT_admin:Admin`, link: '/admin' },
      { label: $localize`:@@HYT_admin_users:Users`, link: '/admin/users' },
      { label: this.isNew || !user ? this.title : userDisplayName(user) },
    ];
  });

  constructor() {
    if (!this.isNew) {
      this.form.controls.password.disable();
      this.form.controls.passwordConfirm.disable();
    }
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.passwordConfirm.updateValueAndValidity({ emitEvent: false }));
    this.load();
  }

  protected load(): void {
    const id = this.userId;
    if (!this.isNew && id === null) {
      this.status.set('error');
      return;
    }
    this.status.set('loading');
    forkJoin({
      roles: this.rolesService.findAll(),
      user: id === null ? of(null) : this.usersService.findWithRoles(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ roles, user }) => {
          this.allRoles.set([...roles].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')));
          if (user) {
            this.fillForm(user.user, user.roles);
          }
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  protected roleNames(ids: number[]): string {
    return this.allRoles()
      .filter(role => role.id !== undefined && ids.includes(role.id))
      .map(role => role.name)
      .join(', ');
  }

  /** Shown under the field until its value changes. */
  protected serverError(field: UserFormField): string | null {
    const error: unknown = this.form.controls[field].errors?.['server'];
    return typeof error === 'string' ? error : null;
  }

  protected submit(): void {
    if (this.saving()) {
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.generalErrors.set([]);
    this.saving.set(true);

    const value: UserFormValue = this.form.getRawValue();
    const original = this.original();
    const save$ = original
      ? this.usersService.update(original, this.originalRoleIds, value)
      : this.usersService.create(value);

    save$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => this.onSaved(result),
      error: (error: unknown) => this.onSaveError(error),
    });
  }

  /** Used by `CanDeactivateGuard`. */
  canDeactivate(): boolean | Observable<boolean> {
    if (this.saved || !this.form.dirty) {
      return true;
    }
    return openAdminConfirmDialog(this.dialogService, {
      title: $localize`:@@HYT_admin_unsaved_title:Discard changes?`,
      message: $localize`:@@HYT_admin_unsaved_message:The changes you made have not been saved.`,
      confirmLabel: $localize`:@@HYT_admin_unsaved_confirm:Discard`,
    });
  }

  private fillForm(user: HUser, roles: Role[]): void {
    this.original.set(user);
    this.originalRoleIds = roles.map(role => role.id).filter((id): id is number => id !== undefined);
    this.form.reset({
      username: user.username ?? '',
      name: user.name ?? '',
      lastname: user.lastname ?? '',
      email: user.email ?? '',
      roleIds: this.originalRoleIds,
    });
  }

  private onSaved(result: UserSaveResult): void {
    this.saving.set(false);
    const name = userDisplayName(result.user);

    if (result.failedRoleIds.length > 0) {
      const roles = this.roleNames(result.failedRoleIds);
      this.toastr.warning(
        $localize`:@@HYT_admin_user_roles_failed:User ${name}:name: saved, but these roles could not be changed: ${roles}:roles:`,
      );
      // show what was saved
      if (this.isNew && result.user.id !== undefined) {
        this.saved = true;
        this.router.navigate(['/admin/users', result.user.id]);
      } else {
        this.load();
      }
      return;
    }

    this.saved = true;
    this.toastr.success(
      this.isNew
        ? $localize`:@@HYT_admin_user_created:User ${name}:name: created`
        : $localize`:@@HYT_admin_user_updated:User ${name}:name: updated`,
    );
    this.router.navigate(['/admin/users']);
  }

  private onSaveError(error: unknown): void {
    this.saving.set(false);
    const general: string[] = [];
    for (const saveError of parseUserSaveError(error)) {
      const control = saveError.field ? this.form.controls[saveError.field] : null;
      if (control && control.enabled) {
        control.setErrors({ ...control.errors, server: saveError.message });
        control.markAsTouched();
      } else {
        general.push(saveError.field ? `${saveError.field}: ${saveError.message}` : saveError.message);
      }
    }
    this.generalErrors.set(general);
  }

  private parseId(raw: string | null): number | null {
    const id = Number(raw);
    return raw !== null && raw.trim() !== '' && Number.isInteger(id) && id > 0 ? id : null;
  }
}
