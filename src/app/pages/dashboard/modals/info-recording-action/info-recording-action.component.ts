import { Component, Input, Output, EventEmitter, Injector } from '@angular/core';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-info-recording-action',
  templateUrl: './info-recording-action.component.html',
  styleUrls: ['./info-recording-action.component.scss']
})
export class InfoRecordingActionComponent extends HytModal {

  @Input() id: string;

  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  next(event) {
    this.modalClose.emit(true);
    this.close();
  }

  back(event) {
    this.modalClose.emit(false);
    this.close();
  }

}
