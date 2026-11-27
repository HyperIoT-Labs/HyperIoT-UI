import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminAccessService, AdminSectionId } from '../admin-access.service';
import { AdminHomeComponent } from './admin-home.component';

function render(allowed: AdminSectionId[]): HTMLElement {
  TestBed.configureTestingModule({
    imports: [AdminHomeComponent],
    providers: [
      provideRouter([]),
      { provide: AdminAccessService, useValue: { canAccessSection: (s: AdminSectionId) => allowed.includes(s) } },
    ],
  });
  const fixture = TestBed.createComponent(AdminHomeComponent);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('AdminHomeComponent', () => {
  it('shows a card for each section the user can open', () => {
    const element = render(['users', 'roles', 'algorithms']);
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a.admin-card-link'));
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/admin/users', '/admin/roles', '/admin/algorithms']);
  });

  it('hides the cards of the sections the user cannot open', () => {
    const element = render(['algorithms']);
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('a.admin-card-link'));
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/admin/algorithms']);
  });

  it('groups users and roles in one category and algorithms in another', () => {
    const element = render(['users', 'roles', 'algorithms']);
    const categories = Array.from(element.querySelectorAll('section.admin-category')).map(section => ({
      title: section.querySelector('h2')?.textContent?.trim(),
      links: Array.from(section.querySelectorAll('a.admin-card-link')).map(link => link.getAttribute('href')),
    }));
    expect(categories).toEqual([
      { title: 'Users and permissions', links: ['/admin/users', '/admin/roles'] },
      { title: 'Data processing', links: ['/admin/algorithms'] },
    ]);
  });

  it('hides a category without sections the user can open', () => {
    const element = render(['algorithms']);
    const titles = Array.from(element.querySelectorAll('section.admin-category h2')).map(h => h.textContent?.trim());
    expect(titles).toEqual(['Data processing']);
  });

  it('shows the breadcrumb Home > Admin with Admin as current page', () => {
    const element = render([]);
    const current = element.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('Admin');
    expect(element.querySelector('nav a')?.getAttribute('href')).toBe('/');
  });
});
