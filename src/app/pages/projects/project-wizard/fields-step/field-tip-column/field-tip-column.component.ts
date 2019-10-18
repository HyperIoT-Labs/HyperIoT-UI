import { Component, OnInit } from '@angular/core';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-field-tip-column',
  templateUrl: './field-tip-column.component.html',
  styleUrls: ['./field-tip-column.component.scss']
})
export class FieldTipColumnComponent implements OnInit {

  constructor(
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.wizardService.hint$[3].subscribe(
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
