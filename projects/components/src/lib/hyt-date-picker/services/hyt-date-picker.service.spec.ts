import { TestBed } from '@angular/core/testing';

import { HytDatePickerService } from './hyt-date-picker.service';

describe('HytDatePickerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HytDatePickerService = TestBed.get(HytDatePickerService);
    expect(service).toBeTruthy();
  });
});
