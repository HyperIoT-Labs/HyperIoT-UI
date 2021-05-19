import { Component, Input, EventEmitter, Output, ViewEncapsulation, Injector, OnDestroy } from '@angular/core';
import { HytModal, HytModalService } from '@hyperiot/components';
import { HytTopologyService } from 'src/app/services/topology-services/hyt-topology.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
  templateUrl: './confirm-recording-action.component.html',
  styleUrls: ['./confirm-recording-action.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmRecordingActionComponent extends HytModal implements OnDestroy {

  topologyActionState: TopologyActionState = TopologyActionState.Confirm;

  topologyRequestState: TopologyRequestState = TopologyRequestState.Still;

  projectId;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  checkTopology = true;

  constructor(
    private hytTopologyService: HytTopologyService,
    hytModalService: HytModalService
  ) {
    super(hytModalService);
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
            console.error(error);
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
          this.close({
            dataRecordingIsOn: true,
            upTimeSec: 0
          });
        }, 1000)
      },
      error => {
        this.topologyRequestState = TopologyRequestState.ConnectingFailed;
        console.error(error);
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
        this.close({
          dataRecordingIsOn: false,
          upTimeSec: 0
        });
      },
      error => {
        this.topologyRequestState = TopologyRequestState.ToOffFailed;
        console.error(error);
      }
    );
  }

  cancel() {
    if (this.data.actionType === 'reload') {
      this.close();
    } else {
      this.close();
    }
  }

  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

}
