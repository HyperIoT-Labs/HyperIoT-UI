import { Component, Input, Output, EventEmitter, Injector } from '@angular/core';
import {HytModal} from "../hyt-modal";
import {HytModalService} from "../hyt-modal.service";

@Component({
  selector: 'hyt-info-recording-action',
  templateUrl: './hyt-info-recording-action.component.html',
  styleUrls: ['./hyt-info-recording-action.component.scss']
})
export class HytInfoRecordingActionComponent extends HytModal {

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
