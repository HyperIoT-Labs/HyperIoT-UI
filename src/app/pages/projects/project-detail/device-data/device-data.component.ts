import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable, Observer } from 'rxjs';

import { MatDialog } from '@angular/material';

import { HdevicesService, HDevice } from '@hyperiot/core';

import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent implements OnInit {
  deviceId: number;
  device: HDevice = {} as HDevice;

  form: FormGroup;
  originalValue: string;

  updateCallback: any = null;
  deleteCallback: any = null;

  constructor(
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.form = this.formBuilder.group({});
    this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.deviceId = activatedRoute.snapshot.params.deviceId;
        this.loadDevice();
      }
    });
  }

  ngOnInit() {
  }

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.openSaveDialog();
    }
    return true;
  }

  onSaveClick() {
    this.saveDevice();
  }

  onDeleteClick() {
    this.openDeleteDialog();
  }

  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }

  private loadDevice() {
    this.hDeviceService.findHDevice(this.deviceId).subscribe((d: HDevice) => {
      this.device = d;
      // update form data
      this.form.get('name')
        .setValue(d.deviceName);
      this.form.get('brand')
        .setValue(d.brand);
      this.form.get('model')
        .setValue(d.model);
      this.form.get('firmware')
        .setValue(d.firmwareVersion);
      this.form.get('software')
        .setValue(d.softwareVersion);
      this.form.get('description')
        .setValue(d.description);
      this.originalValue = JSON.stringify(this.form.value);
    });
  }

  private saveDevice(successCallback?, errorCallback?) {
    let d = this.device;
    d.deviceName = this.form.get('name').value;
    d.description = this.form.get('description').value;
    d.brand = this.form.get('brand').value;
    d.model = this.form.get('model').value;
    d.firmwareVersion = this.form.get('firmware').value;
    d.softwareVersion = this.form.get('software').value;
    this.hDeviceService.updateHDevice(d).subscribe((res) => {
      // TODO: show 'ok' message on screen
      console.log('SUCCESS', res);
      this.device = d = res;
      this.originalValue = JSON.stringify(this.form.value);
      this.updateCallback && this.updateCallback({id: d.id, type: 'device', name: d.deviceName});
      successCallback && successCallback(res);
    }, (err) => {
      // TODO: show 'error' message on screen
      console.log('ERROR', err);
      errorCallback && errorCallback(err);
    });
  }
  private deleteDevice(successCallback?, errorCallback?) {
    this.hDeviceService.deleteHDevice(this.device.id).subscribe((res) => {
      // TODO: show 'ok' message on screen
      console.log('SUCCESS', res);
      this.deleteCallback && this.deleteCallback();
      successCallback && successCallback(res);
    }, (err) => {
      // TODO: show 'error' message on screen
      console.log('ERROR', err);
      errorCallback && errorCallback(err);
    });
  }

  private openSaveDialog(): Observable<boolean> {
    return new Observable((observer: Observer<boolean>) => {
      const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
        data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'save') {
          this.saveDevice((res) => {
            observer.next(true);
            observer.complete();
          }, (err) => {
            observer.next(false);
            observer.complete();
          });
        } else {
          observer.next(result === 'discard' || result === 'save')
          observer.complete();
        }
      });
    });
  }
  private openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {title: 'Delete device?', message: 'This operation cannot be undone.'}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteDevice((res) => {
          // TODO: ...
        }, (err) => {
          // TODO: report error
        });
      }
    });
  }
}
