import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import {
  HytInfoRecordingActionComponent
} from '../../hyt-modal/hyt-info-recording-action/hyt-info-recording-action.component';
import {
  HytConfirmRecordingActionComponent
} from '../../hyt-modal/hyt-confirm-recording-action/hyt-confirm-recording-action.component';
import { DialogService } from '../../hyt-dialog/dialog.service';

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
    private dialogService: DialogService,
  ) { }

  ngOnInit() { }

  openRecordingActionModal() {
    if (!this.recordReloading && !this.recordStateInLoading) {
      this.recordStateInLoading = true;
      if (this.dataRecordingIsOn) {
        const modalRef = this.dialogService.open(HytInfoRecordingActionComponent, { width: '600px', backgroundClosable: true });
        modalRef.afterClosed().subscribe(
          result => {
            if (result === 'confirm') {
              setTimeout(() => {
                this.openConfirmChangeRecordingModal(true);
              }, 500);
            } else {
              this.recordStateInLoading = false;
            }
          },
        );
      } else {
        this.openConfirmChangeRecordingModal(false);
      }
    }
  }

  openConfirmChangeRecordingModal(rocordingState: boolean) {
    const modalRef = this.dialogService.open(
      HytConfirmRecordingActionComponent,
      {
        data: {
          textBodyModal: 'You are about to put the data saving in Play / Pause',
          dataRecordingIsOn: rocordingState,
          actionType: 'start-stop',
          projectId: this.idProjectSelected,
        },
        width: '800px',
      }
    );
    modalRef.afterClosed().subscribe(
      result => {
        this.recordStateInLoading = false;
        this.updateTopologyData(result);
      },
    );
  }

  openReloadRecordingModal() {
    if (!this.recordReloading && !this.recordStateInLoading) {
      this.recordReloading = true;
      this.recordStateInLoading = true;
      const modalRef = this.dialogService.open(
        HytConfirmRecordingActionComponent,
        {
          data: 
          {
            textBodyModal: 'You are about to reboot data saving',
            dataRecordingIsOn: this.dataRecordingIsOn,
            actionType: 'reload',
            projectId: this.idProjectSelected,
          },
          width: '800px',
        },
      );
      modalRef.afterClosed().subscribe(
        result => {
          this.recordReloading = false;
          this.recordStateInLoading = false;
          this.updateTopologyData(result);
        },
      );
    }
  }

  updateTopologyData(data) {
    if (!data) {
      return;
    }
    if (data.dataRecordingIsOn !== undefined) {
      this.dataRecordingIsOn = data.dataRecordingIsOn;
    }
    if (data.upTimeSec && data.upTimeSec === 0) {
      this.upTimeSec = undefined;
    }

    this.recordingStateChange.emit(data);
  }

}
