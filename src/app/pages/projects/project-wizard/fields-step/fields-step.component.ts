import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { HPacket, HDevice } from '@hyperiot/core';


enum FormStatusEnum {
  SelectAction = 0,
  Editable = 1,
  Loading = 2,
  Error = -1
}

@Component({
  selector: 'hyt-fields-step',
  templateUrl: './fields-step.component.html',
  styleUrls: ['./fields-step.component.scss']
})
export class FieldsStepComponent implements OnChanges {

  @Input() hDevices: HDevice[] = [];

  currentPacket: HPacket;

  @Input() hPackets: HPacket[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

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

}
