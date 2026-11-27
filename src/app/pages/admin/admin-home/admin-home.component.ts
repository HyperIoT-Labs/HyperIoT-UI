import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { AdminAccessService, AdminSectionId } from '../admin-access.service';
import { AdminPageHeaderComponent, BreadcrumbItem } from '../admin-page-header/admin-page-header.component';

interface AdminSectionCard {
  id: AdminSectionId;
  title: string;
  description: string;
  icon: string;
  link: string;
}

interface AdminCategory {
  id: string;
  title: string;
  cards: readonly AdminSectionCard[];
}

const USERS_CARD: AdminSectionCard = {
  id: 'users',
  title: $localize`:@@HYT_admin_users:Users`,
  description: $localize`:@@HYT_admin_users_description:Manage the users of the platform`,
  icon: 'icon-hyt_user',
  link: '/admin/users',
};

const ROLES_CARD: AdminSectionCard = {
  id: 'roles',
  title: $localize`:@@HYT_admin_roles:Roles`,
  description: $localize`:@@HYT_admin_roles_description:Manage roles and their permissions`,
  icon: 'icon-hyt_key',
  link: '/admin/roles',
};

const ALGORITHMS_CARD: AdminSectionCard = {
  id: 'algorithms',
  title: $localize`:@@HYT_algorithms:Algorithms`,
  description: $localize`:@@HYT_admin_algorithms_description:Manage the algorithms available to the projects`,
  icon: 'icon-hyt_algorithm',
  link: '/admin/algorithms',
};

const CATEGORIES: readonly AdminCategory[] = [
  {
    id: 'access',
    title: $localize`:@@HYT_admin_category_access:Users and permissions`,
    cards: [USERS_CARD, ROLES_CARD],
  },
  {
    id: 'data-processing',
    title: $localize`:@@HYT_admin_category_data_processing:Data processing`,
    cards: [ALGORITHMS_CARD],
  },
];

/** Accessible sections grouped by category; empty categories are hidden. */
@Component({
  selector: 'hyt-admin-home',
  imports: [RouterLink, MatCardModule, MatRippleModule, AdminPageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss',
})
export class AdminHomeComponent {
  private readonly adminAccess = inject(AdminAccessService);

  protected readonly breadcrumb: BreadcrumbItem[] = [{ label: $localize`:@@HYT_admin:Admin` }];

  protected readonly categories: AdminCategory[] = CATEGORIES
    .map(category => ({
      ...category,
      cards: category.cards.filter(card => this.adminAccess.canAccessSection(card.id)),
    }))
    .filter(category => category.cards.length > 0);
}
