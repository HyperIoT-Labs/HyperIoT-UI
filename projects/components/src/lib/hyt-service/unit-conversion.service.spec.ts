import { TestBed } from '@angular/core/testing';

import { UnitConversionService } from './unit-conversion.service';

describe('UnitConversionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnitConversionService = TestBed.get(UnitConversionService);
    expect(service).toBeTruthy();
  });
});
