import { Component, Input, OnInit, ViewEncapsulation, AfterContentChecked } from '@angular/core';
import { HytModalService } from '@hyperiot/components';
import { Subject } from 'rxjs';
import { ConfirmRecordingActionComponent } from './../../modals/confirm-recording-action/confirm-recording-action.component';
import { InfoRecordingActionComponent } from './../../modals/info-recording-action/info-recording-action.component';
import { HytTopologyService } from 'src/app/services/topology-services/hyt-topology.service';

@Component({
  selector: 'hyt-topology-toolbar',
  templateUrl: './topology-toolbar.component.html',
  styleUrls: ['./topology-toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TopologyToolbarComponent implements OnInit {

  @Input() idProjectSelected;
  @Input() dataRecordingIsOn: boolean;
  @Input() upTimeSec: boolean;
  @Input() recordStateInLoading: boolean;

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
        const modalRef = this.hytModalService.open(InfoRecordingActionComponent);
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
      ConfirmRecordingActionComponent,
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
        ConfirmRecordingActionComponent,
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
  }

}
