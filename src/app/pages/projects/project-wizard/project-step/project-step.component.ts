import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HProject, HprojectsService } from '@hyperiot/core';

@Component({
  selector: 'hyt-project-step',
  templateUrl: './project-step.component.html',
  styleUrls: ['./project-step.component.scss']
})
export class ProjectStepComponent implements OnInit {

  @Output() projectOutput = new EventEmitter<HProject>();

  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private hProjectService: HprojectsService
  ) { }

  ngOnInit() {
    this.projectForm = this.fb.group({});
  }

  createProject() {

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
        console.log(err);
      }
    )
  }

  invalid(): boolean {
    return (
      this.projectForm.get('projectName').invalid ||
      this.projectForm.get('projectDescription').invalid
    )
  }

}
