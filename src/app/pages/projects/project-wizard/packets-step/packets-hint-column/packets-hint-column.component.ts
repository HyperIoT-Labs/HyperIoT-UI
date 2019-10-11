import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HPacket } from '@hyperiot/core';
import { TableStatusEnum } from '../../model/pageStatusEnum';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-packets-hint-column',
  templateUrl: './packets-hint-column.component.html',
  styleUrls: ['./packets-hint-column.component.scss']
})
export class PacketsHintColumnComponent implements OnInit {

  packetsList: HPacket[];

  @Output() deletePacket = new EventEmitter<HPacket>();

  @Output() updatePacket = new EventEmitter<HPacket>();

  @Output() copyPacket = new EventEmitter<HPacket>();

  tableStatus: TableStatusEnum = TableStatusEnum.Loading;

  constructor(
    private projectWizardService: ProjectWizardService
  ) { }

  ngOnInit() {
    this.projectWizardService.hPackets$.subscribe(
      res => {
        this.packetsList = res;
        this.tableStatus = TableStatusEnum.Ok;
      },
      err => this.tableStatus = TableStatusEnum.Error
    )
  }

  copy(data) {
    this.copyPacket.emit(data);
  }
  update(data) {
    this.updatePacket.emit(data);
  }
  delete(data) {
    this.deletePacket.emit(data);
  }

}
