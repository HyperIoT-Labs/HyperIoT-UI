import { TestBed } from '@angular/core/testing';

import { HytTopologyService } from './hyt-topology.service';

describe('HytTopologyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HytTopologyService = TestBed.get(HytTopologyService);
    expect(service).toBeTruthy();
  });
});
