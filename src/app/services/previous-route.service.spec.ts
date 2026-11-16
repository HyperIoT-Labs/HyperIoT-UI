import { TestBed } from '@angular/core/testing';

import { PreviousRouteService } from './previous-route.service';

describe('PreviousRouteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviousRouteService = TestBed.inject(PreviousRouteService);
    expect(service).toBeTruthy();
  });
});