import { TestBed } from '@angular/core/testing';

import { PostLoginService } from './post-login.service';

describe('PostLoginService', () => {
  let service: PostLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
