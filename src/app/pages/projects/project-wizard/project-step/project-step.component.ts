import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HProject, HprojectsService } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { HYTError } from 'src/app/services/errorHandler/models/models';

@Component({
  selector: 'hyt-project-step',
  templateUrl: './project-step.component.html',
  styleUrls: ['./project-step.component.scss']
})
export class ProjectStepComponent implements OnInit {

  @Output() projectOutput = new EventEmitter<HProject>();

  projectForm: FormGroup;

  errors: HYTError[] = [];

  constructor(
    private fb: FormBuilder,
    private hProjectService: HprojectsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.projectForm = this.fb.group({});
  }

  createProject() {

    this.errors = [];

    let hProject: HProject = {
      name: this.projectForm.value.projectName,
      description: this.projectForm.value.projectDescription,
      user: { id: JSON.parse(localStorage.getItem('user')).id, entityVersion: 1 },
      entityVersion: 1
    }

    this.hProjectService.saveHProject(hProject).subscribe(
      res => {
        this.projectOutput.emit(res);
      },
      err => {
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
    )
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
