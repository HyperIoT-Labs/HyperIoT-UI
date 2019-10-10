import { Component } from '@angular/core';
import { HPacket } from '@hyperiot/core';


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
export class FieldsStepComponent {

  currentPacket: HPacket;

  packetChanged(event) {
    this.currentPacket = event;
  }

}
