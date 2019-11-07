import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-wizard-options-modal',
  templateUrl: './wizard-options-modal.component.html',
  styleUrls: ['./wizard-options-modal.component.scss']
})
export class WizardOptionsModalComponent extends HytModal implements OnInit  {

  @Output()
  modalClose: EventEmitter<{action:string, data:any}> = new EventEmitter<{action:string, data:any}>();

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  output(action: string, data: number){
    this.modalClose.emit({action: action, data: data});
    this.close();
  }

}
