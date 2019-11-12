import { TestBed } from '@angular/core/testing';

import { EntitiesService } from './entities.service';

describe('EntitiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntitiesService = TestBed.get(EntitiesService);
    expect(service).toBeTruthy();
  });
});
