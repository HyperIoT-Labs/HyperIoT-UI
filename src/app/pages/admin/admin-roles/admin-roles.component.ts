import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { DialogService } from 'components';
import { Role } from 'core';
import { ToastrService } from 'ngx-toastr';
import { filter, map, switchMap } from 'rxjs';
import { openAdminConfirmDialog } from '../admin-confirm-dialog/admin-confirm-dialog.component';
import { AdminPageHeaderComponent, BreadcrumbItem } from '../admin-page-header/admin-page-header.component';
import { AdminRolesService } from './admin-roles.service';

type LoadStatus = 'loading' | 'ready' | 'error';

/** Below Bootstrap `md` the table becomes a list of cards. */
const PHONE_QUERY = '(max-width: 767.98px)';

@Component({
  selector: 'hyt-admin-roles',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    AdminPageHeaderComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-roles.component.html',
  styleUrl: './admin-roles.component.scss',
})
export class AdminRolesComponent {
  private readonly rolesService = inject(AdminRolesService);
  private readonly dialogService = inject(DialogService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly breadcrumb: BreadcrumbItem[] = [
    { label: $localize`:@@HYT_admin:Admin`, link: '/admin' },
    { label: $localize`:@@HYT_admin_roles:Roles` },
  ];

  protected readonly isPhone = toSignal(
    inject(BreakpointObserver).observe(PHONE_QUERY).pipe(map(state => state.matches)),
    { initialValue: false },
  );

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly roles = signal<Role[]>([]);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  protected readonly sortedRoles = computed(() => {
    const factor = this.sortDirection() === 'asc' ? 1 : -1;
    return [...this.roles()].sort(
      (a, b) => factor * (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' }),
    );
  });

  protected readonly displayedColumns = ['name', 'description', 'actions'];
  protected readonly trackById = (_: number, role: Role) => role.id;

  constructor() {
    this.load();
  }

  protected load(): void {
    this.status.set('loading');
    this.rolesService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: roles => {
          this.roles.set(roles);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  protected onSortChange(sort: Sort): void {
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
  }

  protected editLabel(role: Role): string {
    const name = role.name ?? '';
    return $localize`:@@HYT_admin_roles_edit_aria:Edit role ${name}:name:`;
  }

  protected deleteLabel(role: Role): string {
    const name = role.name ?? '';
    return $localize`:@@HYT_admin_roles_delete_aria:Delete role ${name}:name:`;
  }

  protected confirmDelete(role: Role): void {
    const id = role.id;
    if (id === undefined) {
      return;
    }
    const name = role.name ?? '';
    openAdminConfirmDialog(this.dialogService, {
      title: $localize`:@@HYT_admin_roles_delete_title:Delete role`,
      message: $localize`:@@HYT_admin_roles_delete_message:Do you want to delete the role ${name}:name:? The users with this role lose its permissions. This operation cannot be undone.`,
      confirmLabel: $localize`:@@HYT_delete:Delete`,
    })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.deletingId.set(id);
          return this.rolesService.delete(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.roles.update(roles => roles.filter(r => r.id !== id));
          this.deletingId.set(null);
          this.toastr.success($localize`:@@HYT_admin_roles_deleted:Role ${name}:name: deleted`);
        },
        // the HTTP interceptor already notifies the error
        error: () => this.deletingId.set(null),
      });
  }
}
