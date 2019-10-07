import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HProject, HprojectsService } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { PageStatusEnum } from '../model/pageStatusEnum'
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-project-step',
  templateUrl: './project-step.component.html',
  styleUrls: ['./project-step.component.scss']
})
export class ProjectStepComponent implements OnInit {

  hProject: HProject;

  @Output() projectOutput = new EventEmitter<HProject>();

  projectForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  errors: HYTError[] = [];

  constructor(
    private fb: FormBuilder,
    private hProjectService: HprojectsService,
    private projectWizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.projectForm = this.fb.group({});
  }

  submitProject() {
    if (this.pageStatus == PageStatusEnum.Submitted) {
      this.updateProject();
    }
    else {
      this.createProject();
    }
  }

  projectObs = {
    next: (res) => {
      this.hProject = res;
      this.projectWizardService.setHProject(this.hProject);
      this.projectOutput.emit(this.hProject);
      this.pageStatus = PageStatusEnum.Submitted;
    },
    error: (err) => {
      this.pageStatus = PageStatusEnum.Error;
      this.errors = this.errorHandler.handleCreateHProject(err);
      this.errors.forEach(e => {
        if (e.container != 'general')
          this.projectForm.get(e.container).setErrors({
            validateInjectedError: {
              valid: false
            }
          });
      })
    }
  }

  updateProject() {

    this.pageStatus = PageStatusEnum.Loading;
    this.errors = [];

    this.hProject.name = this.projectForm.value.projectName;
    this.hProject.description = this.projectForm.value.projectDescription;
    this.hProjectService.updateHProject(this.hProject).subscribe(this.projectObs);

  }

  createProject() {

    this.pageStatus = PageStatusEnum.Loading;
    this.errors = [];

    this.hProject = {
      name: this.projectForm.value.projectName,
      description: this.projectForm.value.projectDescription,
      user: { id: JSON.parse(localStorage.getItem('user')).id, entityVersion: 1 },
      entityVersion: 1
    }

    this.hProjectService.saveHProject(this.hProject).subscribe(this.projectObs);

  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  invalid(): boolean {
    return (
      this.projectForm.get('projectName').invalid ||
      this.projectForm.get('projectDescription').invalid
    )
  }

}
