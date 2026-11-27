import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { DialogService } from 'components';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { AdminRolesService } from '../../admin-roles/admin-roles.service';
import { AdminUsersService } from '../admin-users.service';
import { AdminUserFormComponent } from './admin-user-form.component';

// Fake value that meets the password rules, not a real credential.
const RULE_COMPLIANT_VALUE = 'Secret#2026';

const roles = [
  { id: 4, entityVersion: 1, name: 'RegisteredUser' },
  { id: 5, entityVersion: 1, name: 'Operator' },
];

describe('AdminUserFormComponent', () => {
  let usersService: {
    findWithRoles: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    currentUserId: () => number;
  };
  let toastr: { success: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn> };

  async function render(id: string | null) {
    TestBed.configureTestingModule({
      imports: [AdminUserFormComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(id === null ? {} : { id }) } } },
        { provide: AdminUsersService, useValue: usersService },
        { provide: AdminRolesService, useValue: { findAll: () => of(roles) } },
        { provide: DialogService, useValue: { open: vi.fn() } },
        { provide: ToastrService, useValue: toastr },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AdminUserFormComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    function type(name: string, value: string): void {
      const input = element.querySelector<HTMLInputElement>(`input[formcontrolname="${name}"]`);
      expect(input, name).not.toBeNull();
      input!.value = value;
      input!.dispatchEvent(new Event('input'));
    }

    async function submit(): Promise<void> {
      element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    return { fixture, element, navigate, type, submit };
  }

  beforeEach(() => {
    usersService = {
      findWithRoles: vi.fn(() =>
        of({
          user: { id: 7, entityVersion: 2, username: 'mrossi', name: 'Mario', lastname: 'Rossi', email: 'mario@example.com', admin: false },
          roles: [roles[0]],
        }),
      ),
      create: vi.fn(() => of({ user: { id: 10, entityVersion: 1, name: 'Anna', lastname: 'Bianchi' }, failedRoleIds: [] })),
      update: vi.fn(() => of({ user: { id: 7, entityVersion: 3, name: 'Mario', lastname: 'Rossi' }, failedRoleIds: [] })),
      currentUserId: () => 1,
    };
    toastr = { success: vi.fn(), warning: vi.fn() };
  });

  describe('creation', () => {
    it('shows the password fields and no administrator or active controls', async () => {
      const { element } = await render(null);
      expect(element.querySelector('input[formcontrolname="password"]')).not.toBeNull();
      expect(element.querySelector('mat-checkbox, mat-slide-toggle')).toBeNull();
    });

    it('does not save an invalid form', async () => {
      const { submit } = await render(null);
      await submit();
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('creates the user and goes back to the list', async () => {
      const { type, submit, navigate } = await render(null);
      type('username', 'abianchi');
      type('email', 'anna@example.com');
      type('name', 'Anna');
      type('lastname', 'Bianchi');
      type('password', RULE_COMPLIANT_VALUE);
      type('passwordConfirm', RULE_COMPLIANT_VALUE);
      await submit();

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'abianchi', password: RULE_COMPLIANT_VALUE, roleIds: [] }),
      );
      expect(toastr.success).toHaveBeenCalledOnce();
      expect(navigate).toHaveBeenCalledWith(['/admin/users']);
    });

    it('opens the new user when some roles could not be assigned', async () => {
      usersService.create.mockReturnValue(
        of({ user: { id: 10, entityVersion: 1, name: 'Anna', lastname: 'Bianchi' }, failedRoleIds: [5] }),
      );
      const { type, submit, navigate } = await render(null);
      for (const [name, value] of [
        ['username', 'abianchi'], ['email', 'anna@example.com'], ['name', 'Anna'], ['lastname', 'Bianchi'],
        ['password', RULE_COMPLIANT_VALUE], ['passwordConfirm', RULE_COMPLIANT_VALUE],
      ]) {
        type(name, value);
      }
      await submit();

      expect(toastr.warning).toHaveBeenCalledWith(expect.stringContaining('Operator'));
      expect(navigate).toHaveBeenCalledWith(['/admin/users', 10]);
    });
  });

  describe('editing', () => {
    it('loads the user without password fields', async () => {
      const { element } = await render('7');
      expect(usersService.findWithRoles).toHaveBeenCalledWith(7);
      expect(element.querySelector<HTMLInputElement>('input[formcontrolname="username"]')?.value).toBe('mrossi');
      expect(element.querySelector('input[formcontrolname="password"]')).toBeNull();
    });

    it('saves with the loaded user and roles', async () => {
      const { type, submit } = await render('7');
      type('name', 'Marco');
      await submit();

      const [original, originalRoleIds, value] = usersService.update.mock.calls[0];
      expect(original).toMatchObject({ id: 7, entityVersion: 2 });
      expect(originalRoleIds).toEqual([4]);
      expect(value).toMatchObject({ name: 'Marco', roleIds: [4] });
    });

    it('shows an error for an invalid id without calling the server', async () => {
      const { element } = await render('abc');
      expect(usersService.findWithRoles).not.toHaveBeenCalled();
      expect(element.querySelector('[role="alert"]')).not.toBeNull();
    });
  });
});
