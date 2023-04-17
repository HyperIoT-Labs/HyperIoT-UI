import { TestBed } from '@angular/core/testing';

import { UnitFormatterService } from './unit-formatter.service';

describe('UnitFormatterService', () => {
  let service: UnitFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitFormatterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
