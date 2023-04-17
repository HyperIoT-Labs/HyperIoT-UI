import { TestBed } from '@angular/core/testing';

import { DevDataService } from './dev-data.service';

describe('DevDataService', () => {
  let service: DevDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
