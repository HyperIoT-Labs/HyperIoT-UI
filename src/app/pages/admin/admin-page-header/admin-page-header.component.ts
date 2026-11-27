import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** Omitted for the current page. */
  link?: string;
}

/** Breadcrumb from Home on the left, projected page actions on the right. */
@Component({
  selector: 'hyt-admin-page-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="admin-page-header">
      <nav class="breadcrumb-nav" i18n-aria-label="@@HYT_breadcrumb" aria-label="Breadcrumb">
        <span class="hyt-icon icon-hyt_projectSolo" aria-hidden="true"></span>
        <ol>
          <li><a routerLink="/" i18n="@@HYT_home">Home</a></li>
          @for (item of items(); track $index; let last = $last) {
            <li>
              @if (item.link && !last) {
                <a [routerLink]="item.link">{{ item.label }}</a>
              } @else {
                <strong aria-current="page">{{ item.label }}</strong>
              }
            </li>
          }
        </ol>
      </nav>
      <div class="actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    .admin-page-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-height: 50px;
      border-bottom: 1px solid var(--mat-sys-primary);
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      min-width: 0;
      font-size: 1.2em;
    }

    .hyt-icon {
      font-size: 1.8em;
      margin-right: 3px;
      opacity: 0.4;
    }

    ol {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li + li::before {
      content: '>';
      padding: 0 6px;
    }

    a {
      color: inherit;
      display: inline-block;
      padding: 12px 0;
    }

    .actions:empty {
      display: none;
    }
  `,
})
export class AdminPageHeaderComponent {
  readonly items = input<BreadcrumbItem[]>([]);
}
