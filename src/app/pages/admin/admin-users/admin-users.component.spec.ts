import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DialogService } from 'components';
import { HUser } from 'core';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminUsersService } from './admin-users.service';

const users: HUser[] = [
  { id: 1, entityVersion: 1, name: 'Anna', lastname: 'Rossi', username: 'zrossi', email: 'anna@example.com', active: true, admin: true },
  { id: 2, entityVersion: 1, name: 'Bruno', lastname: 'Bianchi', username: 'bbianchi', email: 'bruno@example.com', active: false },
];

describe('AdminUsersComponent', () => {
  let usersService: { findAll: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; currentUserId: () => number };
  let dialogService: { open: ReturnType<typeof vi.fn> };
  let toastr: { success: ReturnType<typeof vi.fn> };

  async function render(): Promise<{ fixture: ComponentFixture<AdminUsersComponent>; element: HTMLElement }> {
    TestBed.configureTestingModule({
      imports: [AdminUsersComponent],
      providers: [
        provideRouter([]),
        { provide: AdminUsersService, useValue: usersService },
        { provide: DialogService, useValue: dialogService },
        { provide: ToastrService, useValue: toastr },
      ],
    });
    const fixture = TestBed.createComponent(AdminUsersComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  function rowNames(element: HTMLElement): string[] {
    return Array.from(element.querySelectorAll('tr[mat-row] td.mat-column-name')).map(cell =>
      (cell.textContent ?? '').replace(/\s+/g, ' ').trim(),
    );
  }

  beforeEach(() => {
    usersService = {
      findAll: vi.fn(() => of(users)),
      delete: vi.fn(() => of(undefined)),
      currentUserId: () => 1,
    };
    dialogService = { open: vi.fn(() => ({ dialogRef: { afterClosed: () => of(true) } })) };
    toastr = { success: vi.fn() };
  });

  it('lists the users sorted by username and marks the logged user', async () => {
    const { element } = await render();
    // usernames: bbianchi < zrossi, the opposite of the name order
    expect(rowNames(element)).toEqual(['Bruno Bianchi', 'Anna Rossi You']);
  });

  it('filters the users with the search field', async () => {
    const { fixture, element } = await render();
    const input = element.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input).not.toBeNull();
    input!.value = 'bianchi';
    input!.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(rowNames(element)).toEqual(['Bruno Bianchi']);
  });

  it('does not offer to delete the logged user', async () => {
    const { element } = await render();
    const deleteButtons = Array.from(element.querySelectorAll<HTMLButtonElement>('td.actions-cell button'));
    expect(deleteButtons.map(button => button.getAttribute('aria-label'))).toEqual(['Delete user Bruno Bianchi']);
  });

  it('deletes a user after confirmation and removes it from the list', async () => {
    const { fixture, element } = await render();
    element.querySelector<HTMLButtonElement>('td.actions-cell button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(dialogService.open).toHaveBeenCalledOnce();
    expect(usersService.delete).toHaveBeenCalledWith(2);
    expect(toastr.success).toHaveBeenCalledOnce();
    expect(rowNames(element)).toEqual(['Anna Rossi You']);
  });

  it('does not delete when the dialog is cancelled', async () => {
    dialogService.open.mockReturnValue({ dialogRef: { afterClosed: () => of(false) } });
    const { fixture, element } = await render();
    element.querySelector<HTMLButtonElement>('td.actions-cell button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(usersService.delete).not.toHaveBeenCalled();
    expect(rowNames(element)).toHaveLength(2);
  });

  it('shows an error with a retry button when loading fails', async () => {
    usersService.findAll.mockReturnValueOnce(throwError(() => new Error('down')));
    const { fixture, element } = await render();
    expect(element.querySelector('[role="alert"]')).not.toBeNull();

    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(usersService.findAll).toHaveBeenCalledTimes(2);
    expect(rowNames(element)).toHaveLength(2);
  });
});
