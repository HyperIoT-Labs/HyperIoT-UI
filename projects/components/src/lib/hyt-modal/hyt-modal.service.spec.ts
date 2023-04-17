import { TestBed } from '@angular/core/testing';

import { HytModalService } from './hyt-modal.service';

describe('HytModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HytModalService = TestBed.get(HytModalService);
    expect(service).toBeTruthy();
  });
});
