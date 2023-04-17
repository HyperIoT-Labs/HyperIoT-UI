import { TestBed } from '@angular/core/testing';

import { AlgorithmOfflineDataService } from './algorithm-offline-data.service';

describe('AlgorithmOfflineDataService', () => {
  let service: AlgorithmOfflineDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlgorithmOfflineDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
