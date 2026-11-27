import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionMasks, ResourceActions } from '../role-permissions';
import { RolePermissionsEditorComponent } from './role-permissions-editor.component';

const PROJECT = 'it.acsoftware.hyperiot.hproject.model.HProject';
const DEVICE = 'it.acsoftware.hyperiot.hdevice.model.HDevice';

const resources: ResourceActions[] = [
  { resourceName: DEVICE, shortName: 'HDevice', actions: [{ name: 'save', id: 1 }, { name: 'find', id: 8 }] },
  { resourceName: PROJECT, shortName: 'HProject', actions: [{ name: 'save', id: 1 }, { name: 'update', id: 2 }, { name: 'find', id: 8 }] },
];

describe('RolePermissionsEditorComponent', () => {
  let fixture: ComponentFixture<RolePermissionsEditorComponent>;
  let element: HTMLElement;

  async function render(masks: PermissionMasks): Promise<void> {
    TestBed.configureTestingModule({ imports: [RolePermissionsEditorComponent] });
    fixture = TestBed.createComponent(RolePermissionsEditorComponent);
    fixture.componentRef.setInput('resources', resources);
    fixture.componentRef.setInput('masks', masks);
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  }

  async function update(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function text(selector: string): string[] {
    return Array.from(element.querySelectorAll(selector)).map(e => (e.textContent ?? '').replace(/\s+/g, ' ').trim());
  }

  function masks(): PermissionMasks {
    return fixture.componentInstance.masks();
  }

  it('lists the resources with the granted/total counter', async () => {
    await render({ [PROJECT]: 9 });
    expect(text('.count')).toEqual(['0/2', '2/3']);
  });

  it('filters the resources by name, keeping the selected one', async () => {
    await render({});
    const search = element.querySelector<HTMLInputElement>('.search input')!;
    search.value = ' PROJ ';
    search.dispatchEvent(new Event('input'));
    await update();

    expect(text('.resource-list [matListItemTitle]')).toEqual(['HProject']);
    expect(element.querySelector('.detail h3')?.textContent).toBe('HDevice');

    search.value = 'nothing';
    search.dispatchEvent(new Event('input'));
    await update();
    expect(element.querySelector('.resource-list nav')).toBeNull();
    expect(element.querySelector('.search input')).not.toBeNull();
    expect(element.querySelector('.no-match')).not.toBeNull();
  });

  it('sorts the resources by granted actions from the sort menu', async () => {
    await render({ [PROJECT]: 1 });
    expect(text('.resource-list [matListItemTitle]')).toEqual(['HDevice', 'HProject']);

    element.querySelector<HTMLButtonElement>('.sort-trigger')!.click();
    await update();
    const items = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
    expect(items.map(item => item.getAttribute('aria-checked'))).toEqual(['true', 'false']);

    items[1].click();
    await update();
    expect(text('.resource-list [matListItemTitle]')).toEqual(['HProject', 'HDevice']);
  });

  it('does not submit the surrounding form when Enter is pressed in the search', async () => {
    await render({});
    const enter = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    element.querySelector<HTMLInputElement>('.search input')!.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
  });

  it('shows the first resource and its actions with their description', async () => {
    await render({});
    expect(element.querySelector('.detail h3')?.textContent).toBe('HDevice');
    expect(text('.detail .action-name')).toEqual(['save', 'find']);
    expect(text('.detail mat-checkbox')).toEqual(['save – Create a device.', 'find – View the device with the given ID.']);
  });

  it('changes the mask when an action is checked', async () => {
    await render({ [PROJECT]: 1 });
    (element.querySelectorAll<HTMLButtonElement>('.resource-list nav button')[1]).click();
    await update();

    element.querySelectorAll<HTMLInputElement>('.detail mat-checkbox input')[1].click();
    await update();

    expect(masks()[PROJECT]).toBe(3);
    expect(text('.summary')).toEqual(['2 of 3 actions granted']);
  });

  it('selects all or none of the actions, keeping unknown bits', async () => {
    await render({ [DEVICE]: 64 });
    const [all, none] = Array.from(element.querySelectorAll<HTMLButtonElement>('.bulk-actions button'));

    all.click();
    await update();
    expect(masks()[DEVICE]).toBe(64 | 1 | 8);

    none.click();
    await update();
    expect(masks()[DEVICE]).toBe(64);
  });
});
