import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Observable, Observer, Subscription } from 'rxjs';

import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatRadioChange } from '@angular/material';

import { HPacket, HpacketsService } from '@hyperiot/core';
import { Option } from '@hyperiot/components';

import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { ProjectDetailComponent } from '../project-detail.component';

enum LoadingStatusEnum {
  Ready,
  Loading,
  Saving,
  Error
}
@Component({
  selector: 'hyt-packet-data',
  templateUrl: './packet-data.component.html',
  styleUrls: ['./packet-data.component.scss']
})
export class PacketDataComponent implements OnDestroy {
  packetId: number;
  packet: HPacket = {} as HPacket;
  deviceName: '---';

  form: FormGroup;
  originalValue: string;

  LoadingStatus = LoadingStatusEnum;
  loadingStatus = LoadingStatusEnum.Ready;

  treeHost: ProjectDetailComponent = null;

  typeOptions: Option[] = Object.keys(HPacket.TypeEnum)
    .map((k) => { return {label: k, value: k} });

  serializationOptions: Option[] = Object.keys(HPacket.SerializationEnum)
    .map((k) => { return {label: k, value: k} });

  formatOptions: Option[] = Object.keys(HPacket.FormatEnum)
    .map((k) => { return {label: k, value: k} });

  trafficPlanOptions: Option[] = Object.keys(HPacket.TrafficPlanEnum)
    .map((k) => { return {label: k, value: k} });

  private circularFix = (key: any, value: any) => {
    if (value instanceof MatRadioChange) {
      // TODO: this should be fixed in HyperIoT components library (hyt-radio-button)
      return value.value;
    }
    return value;
  }

  private routerSubscription: Subscription;

  constructor(
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.form = this.formBuilder.group({});
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = this.activatedRoute.snapshot.params.packetId;
        this.loadPacket();
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  isDirty(): boolean {
    return JSON.stringify(this.form.value, this.circularFix) !== this.originalValue;
  }

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.openSaveDialog();
    }
    return true;
  }

  onSaveClick() {
    this.savePacket();
  }
  onDeleteClick() {
    this.openDeleteDialog();
  }

  private loadPacket() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      // update form data
      this.form.get('name')
        .setValue(p.name);
      this.form.get('type')
        .setValue(p.type);
      this.form.get('serialization')
        .setValue(p.serialization);
      this.form.get('format')
        .setValue(p.format);
      this.form.get('timestampField')
        .setValue(p.timestampField);
      this.form.get('timestampFormat')
        .setValue(p.timestampFormat);
      this.form.get('trafficPlan')
        .setValue(p.trafficPlan);
      this.originalValue = JSON.stringify(this.form.value, this.circularFix);
      this.treeHost && this.treeHost.focus({id: p.id, type: 'packet'});
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
  private savePacket(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    let p = this.packet;
    p.name = this.form.get('name').value;
    p.type = this.form.get('type').value;
    p.type = p.type['value'] || p.type; // TODO: <-- this is a fix for 'hyt-radio-button' bug
    p.serialization = this.form.get('serialization').value;
    p.serialization = p.serialization['value'] || p.serialization; // TODO: <-- this is a fix for 'hyt-radio-button' bug
    p.format = this.form.get('format').value;
    p.format = p.format['value'] || p.format; // TODO: <-- this is a fix for 'hyt-radio-button' bug
    p.timestampField = this.form.get('timestampField').value;
    p.timestampFormat = this.form.get('timestampFormat').value;
    p.trafficPlan = this.form.get('trafficPlan').value;
    this.hPacketService.updateHPacket(p).subscribe((res) => {
      this.packet = p = res;
      this.originalValue = JSON.stringify(this.form.value, this.circularFix);
      this.treeHost && this.treeHost.updateNode({id: p.id, type: 'packet', name: p.name});
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
  private deletePacket(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hPacketService.deleteHPacket(this.packet.id).subscribe((res) => {
      // TODO: implement tree-view refresh
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private openSaveDialog(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
        data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'save') {
          this.savePacket((res) => {
            observer.next(true);
            observer.complete();
          }, (err) => {
            observer.next(false);
            observer.complete();
          });
        } else {
          observer.next(result === 'discard' || result === 'save');
          observer.complete();
        }
      });
    });
  }
  private openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {title: 'Delete project?', message: 'This operation cannot be undone.'}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deletePacket((res) => {
          // Navigate to parent node (device page)
          this.router.navigate([
            '/projects', this.packet.device.project.id,
            {outlets: { projectDetails: ['device', this.packet.device.id] }}
          ]);
          this.treeHost.refresh();
        }, (err) => {
          // TODO: report error
        });
      }
    });
  }
}
