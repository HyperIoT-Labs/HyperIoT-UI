import { TestBed } from '@angular/core/testing';

import { ProjectWizardHttpErrorHandlerService } from './project-wizard-http-error-handler.service';

describe('ProjectWizardHttpErrorHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectWizardHttpErrorHandlerService = TestBed.get(ProjectWizardHttpErrorHandlerService);
    expect(service).toBeTruthy();
  });
});
