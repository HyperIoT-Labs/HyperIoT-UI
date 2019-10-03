import { Component, Input, EventEmitter, Output } from '@angular/core';
import { RulesService, HDevice, HPacket, Rule, HProject } from '@hyperiot/core';


@Component({
  selector: 'hyt-events-step',
  templateUrl: './events-step.component.html',
  styleUrls: ['./events-step.component.scss']
})
export class EventsStepComponent {

  constructor(
    private rulesService: RulesService
  ) { }

  @Input() hDevices: HDevice[] = [];

  currentPacket: HPacket;

  eventList: Rule[] = [];

  @Input() hProject: HProject;

  @Input() hPackets: HPacket[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  @Output() eventsOutput = new EventEmitter<Rule[]>();

  ngOnChanges() {
    this.hDevices = [...this.hDevices];
    this.hPackets = [...this.hPackets];
  }

  packetChanged(event) {
    this.currentPacket = event;
  }

  packetsOutputChanged(event) {
    this.hPacketsOutput.emit(event);
  }

  rulesChanged(event) {
    this.eventList = event;
    this.eventsOutput.emit(event);
  }

  //delete logic

  deleteId: number = -1;

  deleteError: string = null;

  showDeleteModal(id: number) {
    this.deleteError = null;
    this.deleteId = id;
  }

  hideDeleteModal() {
    this.deleteId = -1;
  }

  deleteEvent() {
    this.deleteError = null;
    this.rulesService.deleteRule(this.deleteId).subscribe(
      res => {
        for (let i = 0; i < this.eventList.length; i++) {
          if (this.eventList[i].id == this.deleteId) {
            this.eventList.splice(i, 1);
          }
        }
        this.eventsOutput.emit(this.eventList);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
