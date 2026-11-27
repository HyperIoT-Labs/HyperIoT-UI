import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { DialogService } from 'components';
import { Permission } from 'core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { AdminRolesService } from '../admin-roles.service';
import { ResourceActions } from '../role-permissions';
import { AdminRoleFormComponent } from './admin-role-form.component';

const PROJECT = 'it.acsoftware.hyperiot.hproject.model.HProject';

const resources: ResourceActions[] = [
  { resourceName: PROJECT, shortName: 'HProject', actions: [{ name: 'save', id: 1 }, { name: 'find', id: 8 }] },
];

describe('AdminRoleFormComponent', () => {
  let rolesService: Record<'findResources' | 'findForEdit' | 'create' | 'update', ReturnType<typeof vi.fn>>;
  let dialogService: { open: ReturnType<typeof vi.fn> };

  async function render(id: string | null) {
    TestBed.configureTestingModule({
      imports: [AdminRoleFormComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { id }) } } },
        { provide: AdminRolesService, useValue: rolesService },
        { provide: DialogService, useValue: dialogService },
        { provide: ToastrService, useValue: { success: vi.fn(), warning: vi.fn() } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AdminRoleFormComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    async function update(): Promise<void> {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    return { fixture, element, navigate, update };
  }

  beforeEach(() => {
    const permission: Permission = { id: 1, entityVersion: 1, entityResourceName: PROJECT, resourceId: 0, actionIds: 8 };
    rolesService = {
      findResources: vi.fn(() => of(resources)),
      findForEdit: vi.fn(() =>
        of({ role: { id: 4, entityVersion: 1, name: 'Operator', description: 'Ops' }, permissions: new Map([[PROJECT, permission]]) }),
      ),
      create: vi.fn(() => of({ role: { id: 20, entityVersion: 1, name: 'Viewer' }, failedResources: [] })),
      update: vi.fn(() => of({ role: { id: 4, entityVersion: 2, name: 'Operator' }, failedResources: [] })),
    };
    dialogService = { open: vi.fn(() => ({ dialogRef: { afterClosed: () => of(false) } })) };
  });

  it('creates a role with the selected permissions', async () => {
    const { element, navigate, update } = await render(null);
    const name = element.querySelector<HTMLInputElement>('input[formcontrolname="name"]')!;
    name.value = 'Viewer';
    name.dispatchEvent(new Event('input'));
    element.querySelectorAll<HTMLInputElement>('.detail mat-checkbox input')[1].click();
    await update();

    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await update();

    expect(rolesService.create).toHaveBeenCalledWith({ name: 'Viewer', description: '' }, resources, { [PROJECT]: 8 });
    expect(navigate).toHaveBeenCalledWith(['/admin/roles']);
  });

  it('does not save a role without name', async () => {
    const { element, update } = await render(null);
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await update();
    expect(rolesService.create).not.toHaveBeenCalled();
  });

  it('loads the role and its granted actions', async () => {
    const { element } = await render('4');
    expect(rolesService.findForEdit).toHaveBeenCalledWith(4);
    expect(element.querySelector<HTMLInputElement>('input[formcontrolname="name"]')?.value).toBe('Operator');
    const checked = Array.from(element.querySelectorAll<HTMLInputElement>('.detail mat-checkbox input')).map(i => i.checked);
    expect(checked).toEqual([false, true]);
  });

  it('asks before leaving with changed permissions only', async () => {
    const { fixture, element, update } = await render('4');
    expect(fixture.componentInstance.canDeactivate()).toBe(true);

    element.querySelectorAll<HTMLInputElement>('.detail mat-checkbox input')[0].click();
    await update();

    fixture.componentInstance.canDeactivate();
    expect(dialogService.open).toHaveBeenCalledOnce();
  });
});
