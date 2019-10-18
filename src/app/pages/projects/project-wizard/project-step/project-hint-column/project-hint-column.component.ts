import { Component, OnInit } from '@angular/core';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-project-hint-column',
  templateUrl: './project-hint-column.component.html',
  styleUrls: ['./project-hint-column.component.scss']
})
export class ProjectHintColumnComponent implements OnInit {

  constructor(
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.wizardService.hint$[0].subscribe(
      res => {
        if (res)
          this.showHintMessage(res);
        else {
          this.hideHintMessage();
        }
      }
    );
  }

  hintMessage = '';
  hintVisible = false;

  showHintMessage(message: string) {
    this.hintMessage = message;
    this.hintVisible = true;
  }
  hideHintMessage() {
    this.hintVisible = false;
  }

}
