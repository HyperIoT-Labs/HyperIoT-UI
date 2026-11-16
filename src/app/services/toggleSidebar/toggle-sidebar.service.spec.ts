import { TestBed } from '@angular/core/testing';

import { ToggleSidebarService } from './toggle-sidebar.service';

describe('ToggleSidebarService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToggleSidebarService = TestBed.inject(ToggleSidebarService);
    expect(service).toBeTruthy();
  });
});
