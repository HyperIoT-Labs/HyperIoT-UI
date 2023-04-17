import { TestBed } from '@angular/core/testing';

import { OfflineDataService } from './offline-data.service';

describe('OfflineDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OfflineDataService = TestBed.get(OfflineDataService);
    expect(service).toBeTruthy();
  });
});
