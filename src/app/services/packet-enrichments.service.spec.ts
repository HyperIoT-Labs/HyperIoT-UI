import { TestBed } from '@angular/core/testing';

import { PacketEnrichmentsService } from './packet-enrichments.service';

describe('PacketEnrichmentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PacketEnrichmentsService = TestBed.get(PacketEnrichmentsService);
    expect(service).toBeTruthy();
  });
});
