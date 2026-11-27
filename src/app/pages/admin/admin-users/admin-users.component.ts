import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { DialogService } from 'components';
import { HUser } from 'core';
import { ToastrService } from 'ngx-toastr';
import { filter, map, switchMap } from 'rxjs';
import { openAdminConfirmDialog } from '../admin-confirm-dialog/admin-confirm-dialog.component';
import { AdminPaginatorIntl } from '../admin-paginator-intl';
import { AdminPageHeaderComponent, BreadcrumbItem } from '../admin-page-header/admin-page-header.component';
import { UserSort, UserSortField, filterUsers, sortUsers, userDisplayName } from './admin-users-list';
import { AdminUsersService } from './admin-users.service';

type LoadStatus = 'loading' | 'ready' | 'error';

/** Below Bootstrap `md` the table becomes a list of cards. */
const PHONE_QUERY = '(max-width: 767.98px)';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

@Component({
  selector: 'hyt-admin-users',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    AdminPageHeaderComponent,
  ],
  providers: [{ provide: MatPaginatorIntl, useClass: AdminPaginatorIntl }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss',
})
export class AdminUsersComponent {
  private readonly usersService = inject(AdminUsersService);
  private readonly dialogService = inject(DialogService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly breadcrumb: BreadcrumbItem[] = [
    { label: $localize`:@@HYT_admin:Admin`, link: '/admin' },
    { label: $localize`:@@HYT_admin_users:Users` },
  ];

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly sortFields: { value: UserSortField; label: string }[] = [
    { value: 'username', label: $localize`:@@HYT_admin_users_col_username:Username` },
    { value: 'name', label: $localize`:@@HYT_admin_users_col_name:Name` },
    { value: 'email', label: $localize`:@@HYT_admin_users_col_email:Email` },
  ];

  protected readonly isPhone = toSignal(
    inject(BreakpointObserver).observe(PHONE_QUERY).pipe(map(state => state.matches)),
    { initialValue: false },
  );

  protected readonly currentUserId = this.usersService.currentUserId();

  protected readonly status = signal<LoadStatus>('loading');
  protected readonly users = signal<HUser[]>([]);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchTerm = toSignal(this.search.valueChanges, { initialValue: '' });

  protected readonly sort = signal<UserSort>({ field: 'username', direction: 'asc' });
  protected readonly pageSize = signal(PAGE_SIZE_OPTIONS[0]);
  private readonly requestedPageIndex = signal(0);

  protected readonly filteredUsers = computed(() =>
    sortUsers(filterUsers(this.users(), this.searchTerm()), this.sort()),
  );

  /** Moved back when the page no longer exists. */
  protected readonly pageIndex = computed(() => {
    const lastPage = Math.max(0, Math.ceil(this.filteredUsers().length / this.pageSize()) - 1);
    return Math.min(this.requestedPageIndex(), lastPage);
  });

  protected readonly pageUsers = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  });

  /** Only when the back end sends the users' roles. */
  protected readonly showRoles = computed(() => this.users().some(user => Array.isArray(user.roles)));

  protected readonly displayedColumns = computed(() => [
    'username',
    'name',
    'email',
    'status',
    ...(this.showRoles() ? ['roles'] : []),
    'actions',
  ]);

  protected readonly displayName = userDisplayName;
  protected readonly trackById = (_: number, user: HUser) => user.id;
  protected readonly ascendingLabel = $localize`:@@HYT_admin_sort_ascending:Ascending order`;
  protected readonly descendingLabel = $localize`:@@HYT_admin_sort_descending:Descending order`;

  constructor() {
    this.search.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.requestedPageIndex.set(0));
    this.load();
  }

  protected load(): void {
    this.status.set('loading');
    this.usersService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: users => {
          this.users.set(users);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  protected onSortChange(sort: Sort): void {
    this.sort.set({ field: sort.active as UserSortField, direction: sort.direction === 'desc' ? 'desc' : 'asc' });
  }

  protected setSortField(field: UserSortField): void {
    this.sort.update(sort => ({ ...sort, field }));
  }

  protected toggleSortDirection(): void {
    this.sort.update(sort => ({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' }));
  }

  protected onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.requestedPageIndex.set(event.pageIndex);
  }

  protected isCurrentUser(user: HUser): boolean {
    return user.id !== undefined && user.id === this.currentUserId;
  }

  protected roleNames(user: HUser): string {
    return (user.roles ?? []).map(role => role.name).filter(Boolean).join(', ');
  }

  protected editLabel(user: HUser): string {
    const name = userDisplayName(user);
    return $localize`:@@HYT_admin_users_edit_aria:Edit user ${name}:name:`;
  }

  protected deleteLabel(user: HUser): string {
    const name = userDisplayName(user);
    return $localize`:@@HYT_admin_users_delete_aria:Delete user ${name}:name:`;
  }

  protected confirmDelete(user: HUser): void {
    const id = user.id;
    if (id === undefined || this.isCurrentUser(user)) {
      return;
    }
    const name = userDisplayName(user);
    openAdminConfirmDialog(this.dialogService, {
      title: $localize`:@@HYT_admin_users_delete_title:Delete user`,
      message: $localize`:@@HYT_admin_users_delete_message:Do you want to delete the user ${name}:name:? This operation cannot be undone.`,
      confirmLabel: $localize`:@@HYT_delete:Delete`,
    })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.deletingId.set(id);
          return this.usersService.delete(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== id));
          this.deletingId.set(null);
          this.toastr.success($localize`:@@HYT_admin_users_deleted:User ${name}:name: deleted`);
        },
        // the HTTP interceptor already notifies the error
        error: () => this.deletingId.set(null),
      });
  }
}
