import { TestBed } from '@angular/core/testing';

import { ProjectWizardService } from './project-wizard.service';

describe('ProjectWizardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectWizardService = TestBed.get(ProjectWizardService);
    expect(service).toBeTruthy();
  });
});
