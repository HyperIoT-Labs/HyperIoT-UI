import { Component, Input, Output, EventEmitter, Injector } from '@angular/core';
import { HytModal, HytModalService } from 'components';

@Component({
  selector: 'hyt-info-recording-action',
  templateUrl: './info-recording-action.component.html',
  styleUrls: ['./info-recording-action.component.scss']
})
export class InfoRecordingActionComponent extends HytModal {

  constructor(
    hytModalService: HytModalService
  ) {
    super(hytModalService);
  }

  next(event) {
    this.close(event);
  }

  back(event) {
    this.close(event);
  }

}
