import { TestBed } from '@angular/core/testing';

import { HytModalConfService } from './hyt-modal-conf.service';

describe('HytModalConfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HytModalConfService = TestBed.get(HytModalConfService);
    expect(service).toBeTruthy();
  });
});
