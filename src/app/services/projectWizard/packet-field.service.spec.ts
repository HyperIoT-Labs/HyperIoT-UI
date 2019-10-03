import { TestBed } from '@angular/core/testing';

import { PacketFieldService } from './packet-field.service';

describe('PacketFieldService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PacketFieldService = TestBed.get(PacketFieldService);
    expect(service).toBeTruthy();
  });
});
