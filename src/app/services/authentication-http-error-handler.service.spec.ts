import { TestBed } from '@angular/core/testing';

import { AuthenticationHttpErrorHandlerService } from './authentication-http-error-handler.service';

describe('AuthenticationHttpErrorHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthenticationHttpErrorHandlerService = TestBed.get(AuthenticationHttpErrorHandlerService);
    expect(service).toBeTruthy();
  });
});
