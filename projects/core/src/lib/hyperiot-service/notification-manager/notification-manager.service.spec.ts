import { TestBed } from '@angular/core/testing';

import { NotificationManagerService } from './notification-manager.service';

describe('NotificationManagerService', () => {
  let service: NotificationManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
