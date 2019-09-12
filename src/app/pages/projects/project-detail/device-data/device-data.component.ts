import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { HdevicesService, HDevice } from '@hyperiot/core';
import { Observable, Observer } from 'rxjs';
import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { MatDialog } from '@angular/material';
import { map } from 'rxjs/operators';

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
      return this.openDialog();
    }
    return true;
  }

  onSaveClick() {
    this.saveDevice();
    this.hDeviceService.updateHDevice(this.device).subscribe((res) => {
      // TODO: show 'ok' message on screen
      console.log('@@@', res);
      this.originalValue = JSON.stringify(this.form.value);
    }, (err) => {
      // TODO: show 'error' message on screen
      console.log('ERROR', err);
    });
  }

  onDeleteClick() {
    // TODO: ...
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

  private saveDevice() {
    const d = this.device;
    d.deviceName = this.form.get('name').value;
    d.description = this.form.get('description').value;
    d.brand = this.form.get('brand').value;
    d.model = this.form.get('model').value;
    d.firmwareVersion = this.form.get('firmware').value;
    d.softwareVersion = this.form.get('software').value;
  }

  private openDialog(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
        data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result === 'save') {
          this.saveDevice();
          this.hDeviceService.updateHDevice(this.device).subscribe((res) => {
            console.log('@@@', res);
            this.originalValue = JSON.stringify(this.form.value);
            observer.next(true);
            observer.complete();
          }, (err) => {
            // TODO: show error message on screen
            console.log('ERROR', err);
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
}
