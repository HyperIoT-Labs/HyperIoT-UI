import { TestBed } from '@angular/core/testing';

import { RealtimeDataService } from './realtime-data.service';

describe('RealtimeDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RealtimeDataService = TestBed.inject(RealtimeDataService);
    expect(service).toBeTruthy();
  });
});
