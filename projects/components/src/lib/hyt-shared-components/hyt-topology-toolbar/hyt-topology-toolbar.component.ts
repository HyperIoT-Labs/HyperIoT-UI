import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import {
  HytInfoRecordingActionComponent
} from '../../hyt-modal/hyt-info-recording-action/hyt-info-recording-action.component';
import {
  HytConfirmRecordingActionComponent
} from '../../hyt-modal/hyt-confirm-recording-action/hyt-confirm-recording-action.component';
import {HytModalService} from '../../hyt-modal/hyt-modal.service';

@Component({
  selector: 'hyt-topology-toolbar',
  templateUrl: './hyt-topology-toolbar.component.html',
  styleUrls: ['./hyt-topology-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytTopologyToolbarComponent implements OnInit {

  @Input() idProjectSelected;
  @Input() dataRecordingIsOn: boolean;
  @Input() upTimeSec: boolean;
  @Input() recordStateInLoading: boolean;
  @Output() recordingStateChange: EventEmitter<any> = new EventEmitter();

  recordReloading = false;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private hytModalService: HytModalService
  ) { }

  ngOnInit() { }

  openRecordingActionModal() {
    if (!this.recordReloading && !this.recordStateInLoading) {
      this.recordStateInLoading = true;
      if (this.dataRecordingIsOn) {
        const modalRef = this.hytModalService.open(HytInfoRecordingActionComponent);
        modalRef.onClosed.subscribe(
          result => {
            if (result === 'confirm') {
              setTimeout(() => {
                this.openConfirmChangeRecordingModal(true);
              }, 500);
            } else {
              this.recordStateInLoading = false;
            }
          },
          error => {
            console.error(error);
          }
        );
      } else {
        this.openConfirmChangeRecordingModal(false);
      }
    }
  }

  openConfirmChangeRecordingModal(rocordingState: boolean) {
    const modalRef = this.hytModalService.open(
      HytConfirmRecordingActionComponent,
      {
        textBodyModal: 'You are about to put the data saving in Play / Pause',
        dataRecordingIsOn: rocordingState,
        actionType: 'start-stop',
        projectId: this.idProjectSelected
      },
      false
    );
    modalRef.onClosed.subscribe(
      result => {
        this.recordStateInLoading = false;
        this.updateTopologyData(result);
      },
      error => {
        this.recordStateInLoading = false;
        console.error(error);
      },
      () => {
        this.recordStateInLoading = false;
      }
    );
  }

  openReloadRecordingModal() {
    if (!this.recordReloading && !this.recordStateInLoading) {
      this.recordReloading = true;
      this.recordStateInLoading = true;
      const modalRef = this.hytModalService.open(
        HytInfoRecordingActionComponent,
        {
          textBodyModal: 'You are about to reboot data saving',
          dataRecordingIsOn: this.dataRecordingIsOn,
          actionType: 'reload',
          projectId: this.idProjectSelected
        },
        false
      );
      modalRef.onClosed.subscribe(
        result => {
          this.recordReloading = false;
          this.recordStateInLoading = false;
          this.updateTopologyData(result);
        },
        error => {
          this.recordReloading = false;
          this.recordStateInLoading = false;
          console.error(error);
        },
        () => {
          this.recordReloading = false;
          this.recordStateInLoading = false;
        }
      );
    }
  }

  updateTopologyData(data) {
    if (data.dataRecordingIsOn !== undefined) {
      this.dataRecordingIsOn = data.dataRecordingIsOn;
    }
    if (data.upTimeSec && data.upTimeSec === 0) {
      this.upTimeSec = undefined;
    }

    this.recordingStateChange.emit(data);
  }

}
