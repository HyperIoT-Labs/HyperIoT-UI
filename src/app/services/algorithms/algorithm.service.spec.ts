import { TestBed } from '@angular/core/testing';

import { AlgorithmService } from './algorithm.service';

describe('AlgorithmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AlgorithmService = TestBed.get(AlgorithmService);
    expect(service).toBeTruthy();
  });
});
