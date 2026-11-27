import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DialogService } from 'components';
import { Permission, Role } from 'core';
import { ToastrService } from 'ngx-toastr';
import { Observable, forkJoin, of } from 'rxjs';
import { openAdminConfirmDialog } from '../../admin-confirm-dialog/admin-confirm-dialog.component';
import { AdminPageHeaderComponent, BreadcrumbItem } from '../../admin-page-header/admin-page-header.component';
import { parseSaveError } from '../../admin-save-errors';
import { AdminRolesService, RoleFormValue, RoleSaveResult } from '../admin-roles.service';
import { PermissionMasks, ResourceActions, hasPermissionChanges, masksOf, planPermissionChanges, shortResourceName } from '../role-permissions';
import { RolePermissionsEditorComponent } from '../role-permissions-editor/role-permissions-editor.component';

type LoadStatus = 'loading' | 'ready' | 'error';

const ROLE_FORM_FIELDS = ['name', 'description'] as const;
type RoleFormField = (typeof ROLE_FORM_FIELDS)[number];

@Component({
  selector: 'hyt-admin-role-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    AdminPageHeaderComponent,
    RolePermissionsEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-role-form.component.html',
  styleUrl: './admin-role-form.component.scss',
})
export class AdminRoleFormComponent {
  private readonly rolesService = inject(AdminRolesService);
  private readonly dialogService = inject(DialogService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly rawId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly isNew = this.rawId === null;
  /** `null` when creating or with an invalid id. */
  protected readonly roleId = this.parseId(this.rawId);

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly saving = signal(false);
  protected readonly generalErrors = signal<string[]>([]);
  protected readonly resources = signal<ResourceActions[]>([]);
  protected readonly masks = signal<PermissionMasks>({});
  private readonly original = signal<Role | null>(null);
  private originalPermissions = new Map<string, Permission>();
  /** After a save, leaving does not ask to discard changes. */
  private saved = false;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(3000)]],
  });

  protected readonly title = this.isNew
    ? $localize`:@@HYT_admin_role_new:New role`
    : $localize`:@@HYT_admin_role_edit:Edit role`;

  protected readonly breadcrumb = computed<BreadcrumbItem[]>(() => {
    const role = this.original();
    return [
      { label: $localize`:@@HYT_admin:Admin`, link: '/admin' },
      { label: $localize`:@@HYT_admin_roles:Roles`, link: '/admin/roles' },
      { label: this.isNew || !role?.name ? this.title : role.name },
    ];
  });

  private readonly permissionsChanged = computed(() =>
    hasPermissionChanges(
      planPermissionChanges(this.resources(), this.originalPermissions, this.masks(), this.original() ?? { entityVersion: 1 }),
    ),
  );

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = this.roleId;
    if (!this.isNew && id === null) {
      this.status.set('error');
      return;
    }
    this.status.set('loading');
    forkJoin({
      resources: this.rolesService.findResources(),
      role: id === null ? of(null) : this.rolesService.findForEdit(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ resources, role }) => {
          this.resources.set(resources);
          if (role) {
            this.original.set(role.role);
            this.originalPermissions = role.permissions;
            this.form.reset({ name: role.role.name ?? '', description: role.role.description ?? '' });
          }
          this.masks.set(masksOf(this.originalPermissions));
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  /** Shown under the field until its value changes. */
  protected serverError(field: RoleFormField): string | null {
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

    const value: RoleFormValue = this.form.getRawValue();
    const original = this.original();
    const save$ = original
      ? this.rolesService.update(original, this.originalPermissions, value, this.resources(), this.masks())
      : this.rolesService.create(value, this.resources(), this.masks());

    save$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: result => this.onSaved(result),
      error: (error: unknown) => this.onSaveError(error),
    });
  }

  /** Used by `CanDeactivateGuard`. */
  canDeactivate(): boolean | Observable<boolean> {
    if (this.saved || (!this.form.dirty && !this.permissionsChanged())) {
      return true;
    }
    return openAdminConfirmDialog(this.dialogService, {
      title: $localize`:@@HYT_admin_unsaved_title:Discard changes?`,
      message: $localize`:@@HYT_admin_unsaved_message:The changes you made have not been saved.`,
      confirmLabel: $localize`:@@HYT_admin_unsaved_confirm:Discard`,
    });
  }

  private onSaved(result: RoleSaveResult): void {
    this.saving.set(false);
    const name = result.role.name ?? '';

    if (result.failedResources.length > 0) {
      const resources = result.failedResources.map(shortResourceName).join(', ');
      this.toastr.warning(
        $localize`:@@HYT_admin_role_permissions_failed:Role ${name}:name: saved, but these permissions could not be saved: ${resources}:resources:`,
      );
      // show what was saved
      if (this.isNew && result.role.id !== undefined) {
        this.saved = true;
        this.router.navigate(['/admin/roles', result.role.id]);
      } else {
        this.load();
      }
      return;
    }

    this.saved = true;
    this.toastr.success(
      this.isNew
        ? $localize`:@@HYT_admin_role_created:Role ${name}:name: created`
        : $localize`:@@HYT_admin_role_updated:Role ${name}:name: updated`,
    );
    this.router.navigate(['/admin/roles']);
  }

  private onSaveError(error: unknown): void {
    this.saving.set(false);
    const general: string[] = [];
    for (const saveError of parseSaveError(error, ROLE_FORM_FIELDS)) {
      const control = saveError.field ? this.form.controls[saveError.field] : null;
      if (control) {
        control.setErrors({ ...control.errors, server: saveError.message });
        control.markAsTouched();
      } else {
        general.push(saveError.message);
      }
    }
    this.generalErrors.set(general);
  }

  private parseId(raw: string | null): number | null {
    const id = Number(raw);
    return raw !== null && raw.trim() !== '' && Number.isInteger(id) && id > 0 ? id : null;
  }
}
