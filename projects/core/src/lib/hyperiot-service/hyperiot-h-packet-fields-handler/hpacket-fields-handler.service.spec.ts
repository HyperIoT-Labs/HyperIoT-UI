import { TestBed } from '@angular/core/testing';

import { HPacketFieldsHandlerService } from './hpacket-fields-handler.service';

describe('HPacketFieldsHandlerService', () => {
  let service: HPacketFieldsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HPacketFieldsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
