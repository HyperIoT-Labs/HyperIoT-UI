import { BreakpointObserver } from '@angular/cdk/layout';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, model, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs';
import { actionDescription } from '../role-action-descriptions';
import {
  PermissionMasks,
  ResourceAction,
  ResourceActions,
  allActionsMask,
  grantedCount,
  hasAction,
  withAction,
} from '../role-permissions';

/** Below Bootstrap `md` the resource list becomes a select. */
const PHONE_QUERY = '(max-width: 767.98px)';

type ResourceSort = 'name' | 'granted';

/** Edits the masks in place (`[(masks)]`). */
@Component({
  selector: 'hyt-role-permissions-editor',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './role-permissions-editor.component.html',
  styleUrl: './role-permissions-editor.component.scss',
})
export class RolePermissionsEditorComponent {
  readonly resources = input.required<ResourceActions[]>();
  readonly masks = model.required<PermissionMasks>();

  protected readonly isPhone = toSignal(
    inject(BreakpointObserver).observe(PHONE_QUERY).pipe(map(state => state.matches)),
    { initialValue: false },
  );

  protected readonly description = actionDescription;

  protected readonly search = new FormControl('', { nonNullable: true });
  private readonly searchText = toSignal(this.search.valueChanges, { initialValue: '' });

  protected readonly sortBy = signal<ResourceSort>('name');

  /** The input is sorted by name, which also breaks ties. */
  protected readonly visibleResources = computed(() => {
    const text = this.searchText().trim().toLowerCase();
    const visible = this.resources().filter(resource => resource.shortName.toLowerCase().includes(text));
    if (this.sortBy() === 'name') {
      return visible;
    }
    const masks = this.masks();
    const granted = (resource: ResourceActions) => grantedCount(masks[resource.resourceName] ?? 0, resource.actions);
    return visible.sort((a, b) => granted(b) - granted(a));
  });

  private readonly selectedName = signal<string | null>(null);

  /** The first resource until the user picks one; searching does not change it. */
  protected readonly selected = computed(() => {
    const resources = this.resources();
    return resources.find(resource => resource.resourceName === this.selectedName()) ?? resources[0] ?? null;
  });

  protected select(resourceName: string): void {
    this.selectedName.set(resourceName);
  }

  protected maskOf(resource: ResourceActions): number {
    return this.masks()[resource.resourceName] ?? 0;
  }

  protected granted(resource: ResourceActions): number {
    return grantedCount(this.maskOf(resource), resource.actions);
  }

  protected isGranted(resource: ResourceActions, action: ResourceAction): boolean {
    return hasAction(this.maskOf(resource), action.id);
  }

  protected toggle(resource: ResourceActions, action: ResourceAction, granted: boolean): void {
    this.setMask(resource, withAction(this.maskOf(resource), action.id, granted));
  }

  protected selectAll(resource: ResourceActions): void {
    this.setMask(resource, this.maskOf(resource) | allActionsMask(resource.actions));
  }

  protected selectNone(resource: ResourceActions): void {
    this.setMask(resource, this.maskOf(resource) & ~allActionsMask(resource.actions));
  }

  private setMask(resource: ResourceActions, mask: number): void {
    this.masks.update(masks => ({ ...masks, [resource.resourceName]: mask }));
  }
}
