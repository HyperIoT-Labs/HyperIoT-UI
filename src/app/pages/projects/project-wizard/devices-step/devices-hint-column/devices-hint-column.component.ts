import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HDevice } from '@hyperiot/core';
import { TableStatusEnum } from '../../model/pageStatusEnum';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-devices-hint-column',
  templateUrl: './devices-hint-column.component.html',
  styleUrls: ['./devices-hint-column.component.scss']
})
export class DevicesHintColumnComponent implements OnInit {

  devicesList: HDevice[];

  @Output() deleteDevice = new EventEmitter<HDevice>();

  @Output() updateDevice = new EventEmitter<HDevice>();

  @Output() copyDevice = new EventEmitter<HDevice>();

  tableStatus: TableStatusEnum = TableStatusEnum.Loading;

  constructor(
    private wizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.wizardService.hDevices$.subscribe(
      res => {
        this.devicesList = res;
        this.tableStatus = TableStatusEnum.Ok;
      },
      err => this.tableStatus = TableStatusEnum.Error
    )
    this.wizardService.hint$[1].subscribe(
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
    this.copyDevice.emit(data);
  }
  update(data) {
    this.updateDevice.emit(data);
  }
  delete(data) {
    this.deleteDevice.emit(data);
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
