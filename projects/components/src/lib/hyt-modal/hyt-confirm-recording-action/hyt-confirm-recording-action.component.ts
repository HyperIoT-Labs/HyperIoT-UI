import { Component, Input, EventEmitter, Output, ViewEncapsulation, Injector, OnDestroy, Inject } from '@angular/core';
import { HytTopologyService } from '../../hyt-shared-components/hyt-topology-services/hyt-topology.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogRef } from '../../hyt-dialog/dialog-ref';
import { DIALOG_DATA } from '../../hyt-dialog/dialog-tokens';
import {Logger, LoggerService} from "core";

enum TopologyActionState {
  Confirm = 0,
  LoadingOn = 1,
  LoadingOff = 2
}

enum TopologyRequestState {
  ToOffFailed = -1,
  Still = 0,
  Submitting = 1,
  SubmittingFailed = 2,
  Connecting = 3,
  ConnectingFailed = 4,
  Completed = 5
}

@Component({
  selector: 'hyt-confirm-recording-action',
  templateUrl: './hyt-confirm-recording-action.component.html',
  styleUrls: ['./hyt-confirm-recording-action.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytConfirmRecordingActionComponent implements OnDestroy {

  topologyActionState: TopologyActionState = TopologyActionState.Confirm;

  topologyRequestState: TopologyRequestState = TopologyRequestState.Still;

  projectId;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  private logger: Logger;

  checkTopology = true;

  constructor(
    private hytTopologyService: HytTopologyService,
    private loggerService: LoggerService,
    private dialogRef: DialogRef<{ dataRecordingIsOn: boolean; upTimeSec: number; }>,
    @Inject(DIALOG_DATA) public data: any,
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(HytConfirmRecordingActionComponent.name);
  }

  confirm() {
    if (this.data.actionType === 'start-stop' && this.data.dataRecordingIsOn) {
      this.topologyActionState = TopologyActionState.LoadingOff;
      this.changeRecordingStateToOff();
    } else if (this.data.actionType === 'restart') {
      this.hytTopologyService.postRecordingStateOff(this.data.projectId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.topologyActionState = TopologyActionState.LoadingOn;
          this.topologyRequestState = TopologyRequestState.Submitting;
          this.topologyRequest();
        },
        error => {
            this.topologyRequestState = TopologyRequestState.ToOffFailed;
            this.logger.error(error);
        });
    } else {
      this.topologyActionState = TopologyActionState.LoadingOn;
      this.topologyRequestState = TopologyRequestState.Submitting;
      this.topologyRequest();
    }
  }

  topologyRequest() {
    this.topologyRequestState = TopologyRequestState.Connecting;

    this.hytTopologyService.postRecordingStateOn(this.data.projectId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      res => {
        this.topologyRequestState = TopologyRequestState.Completed;
        setTimeout(() => {
          this.dialogRef.close({
            dataRecordingIsOn: true,
            upTimeSec: 0
          });
        }, 1000)
      },
      error => {
        this.topologyRequestState = TopologyRequestState.ConnectingFailed;
        this.logger.error(error);
      }
    );

  }

  changeRecordingStateToOff(callback?: Function) {
    this.topologyRequestState = TopologyRequestState.Submitting;

    this.hytTopologyService.postRecordingStateOff(this.data.projectId)
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(
      res => {
        this.topologyRequestState = TopologyRequestState.Completed;
        this.dialogRef.close({
          dataRecordingIsOn: false,
          upTimeSec: 0
        });
      },
      error => {
        this.topologyRequestState = TopologyRequestState.ToOffFailed;
        this.logger.error(error);
      }
    );
  }

  cancel() {
    if (this.data.actionType === 'reload') {
      this.dialogRef.close();
    } else {
      this.dialogRef.close();
    }
  }

  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  close() {
    this.dialogRef.close();
  }

}
