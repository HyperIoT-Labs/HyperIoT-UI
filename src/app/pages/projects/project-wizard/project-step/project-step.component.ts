import { Component, Output, EventEmitter } from '@angular/core';
import { HProject } from '@hyperiot/core';

@Component({
  selector: 'hyt-project-step',
  templateUrl: './project-step.component.html',
  styleUrls: ['./project-step.component.scss']
})
export class ProjectStepComponent {

  @Output() projectOutput = new EventEmitter<HProject>();

  updateProject(proj) {
    this.projectOutput.emit(proj);
  }

}
