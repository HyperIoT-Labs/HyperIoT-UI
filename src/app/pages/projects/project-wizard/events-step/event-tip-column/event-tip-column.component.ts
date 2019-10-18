import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Rule } from '@hyperiot/core';
import { TableStatusEnum } from '../../model/pageStatusEnum';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-event-tip-column',
  templateUrl: './event-tip-column.component.html',
  styleUrls: ['./event-tip-column.component.scss']
})
export class EventTipColumnComponent implements OnInit {

  eventRules: Rule[];

  @Output() copyEventRule = new EventEmitter<Rule>();

  @Output() updateEventRule = new EventEmitter<Rule>();

  @Output() deleteEventRule = new EventEmitter<Rule>();

  tableStatus: TableStatusEnum = TableStatusEnum.Loading;

  constructor(
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.wizardService.eventRules$.subscribe(
      (res: Rule[]) => {
        this.eventRules = res;
        this.tableStatus = TableStatusEnum.Ok;
      },
      err => this.tableStatus = TableStatusEnum.Error
    );
    this.wizardService.hint$[6].subscribe(
      res => {
        if (res)
          this.showHintMessage(res);
        else {
          this.hideHintMessage();
        }
      }
    );
  }

  copy(data) {
    this.copyEventRule.emit(data);
  }
  update(data) {
    this.updateEventRule.emit(data);
  }
  delete(data) {
    this.deleteEventRule.emit(data);
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
