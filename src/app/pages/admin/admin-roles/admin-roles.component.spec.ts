import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from 'components';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { AdminRolesComponent } from './admin-roles.component';
import { AdminRolesService } from './admin-roles.service';

const roles = [
  { id: 5, entityVersion: 1, name: 'Viewer', description: 'Read only' },
  { id: 4, entityVersion: 1, name: 'Operator', description: 'Operators' },
];

describe('AdminRolesComponent', () => {
  let rolesService: { findAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let dialogService: { open: ReturnType<typeof vi.fn> };

  async function render() {
    TestBed.configureTestingModule({
      imports: [AdminRolesComponent],
      providers: [
        provideRouter([]),
        { provide: AdminRolesService, useValue: rolesService },
        { provide: DialogService, useValue: dialogService },
        { provide: ToastrService, useValue: { success: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(AdminRolesComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function names(element: HTMLElement): string[] {
    return Array.from(element.querySelectorAll('td.mat-column-name')).map(cell => (cell.textContent ?? '').trim());
  }

  beforeEach(() => {
    rolesService = { findAll: vi.fn(() => of(roles)), delete: vi.fn(() => of(undefined)) };
    dialogService = { open: vi.fn(() => ({ dialogRef: { afterClosed: () => of(true) } })) };
  });

  it('lists the roles sorted by name with an edit link', async () => {
    const { element } = await render();
    expect(names(element)).toEqual(['Operator', 'Viewer']);
    expect(element.querySelector('td.actions-cell a')?.getAttribute('href')).toBe('/admin/roles/4');
  });

  it('deletes a role after confirmation', async () => {
    const { fixture, element } = await render();
    element.querySelector<HTMLButtonElement>('td.actions-cell button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(rolesService.delete).toHaveBeenCalledWith(4);
    expect(names(element)).toEqual(['Viewer']);
  });

  it('shows an error when loading fails', async () => {
    rolesService.findAll.mockReturnValue(throwError(() => new Error('down')));
    const { element } = await render();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();
  });
});
