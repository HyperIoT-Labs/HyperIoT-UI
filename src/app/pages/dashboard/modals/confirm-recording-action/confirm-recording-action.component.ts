import { Component, OnInit, Input, ElementRef, OnDestroy, EventEmitter, Output, ViewEncapsulation, Injector } from '@angular/core';
import { DashboardConfigService } from '../../dashboard-config.service';
import { HytModalConfService } from 'src/app/services/hyt-modal-conf.service';
import { HytModal } from 'src/app/services/hyt-modal';

@Component({
  selector: 'hyt-confirm-recording-action',
  templateUrl: './confirm-recording-action.component.html',
  styleUrls: ['./confirm-recording-action.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmRecordingActionComponent extends HytModal implements OnInit, OnDestroy {

  @Input() id: string;

  @Input() textBodyModal: string;

  @Output() modalClose: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    injector: Injector
  ) {
    super(injector);
  }

  confirm(event) {
    this.modalClose.emit(true);
    this.close();
  }

  cancel(event) {
    this.modalClose.emit(false);
    this.close();
  }

}
