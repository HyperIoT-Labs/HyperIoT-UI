import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HdevicesService, HDevice } from '@hyperiot/core';

import { ProjectDetailEntity, LoadingStatusEnum } from '../project-detail-entity';

@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent extends ProjectDetailEntity implements OnInit, OnDestroy {
  deviceId: number;
  device: HDevice = {} as HDevice;

  private routerSubscription: Subscription;

  constructor(
    formBuilder: FormBuilder,
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder);
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.deviceId = activatedRoute.snapshot.params.deviceId;
        this.loadDevice();
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.saveDevice(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deleteDevice(successCallback, errorCallback);
  }

  private loadDevice() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hDeviceService.findHDevice(this.deviceId).subscribe((d: HDevice) => {
      this.device = d;
      // update form data
      this.form.get('hdevice-devicename')
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
      this.resetForm();
      this.treeHost.focus({ id: d.id, type: 'device' });
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.validationError = [];
    let d = this.device;
    d.deviceName = this.form.get('hdevice-devicename').value;
    d.description = this.form.get('description').value;
    d.brand = this.form.get('brand').value;
    d.model = this.form.get('model').value;
    d.firmwareVersion = this.form.get('firmware').value;
    d.softwareVersion = this.form.get('software').value;
    this.hDeviceService.updateHDevice(d).subscribe((res) => {
      this.device = d = res;
      this.resetForm();
      this.treeHost && this.treeHost.updateNode({ id: d.id, type: 'device', name: d.deviceName });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    }, (err) => {
      if (err.error && err.error.validationErrors) {
        this.setError(err);
        this.loadingStatus = LoadingStatusEnum.Ready;
      } else {
        this.loadingStatus = LoadingStatusEnum.Error;
      }
      errorCallback && errorCallback(err);
    });
  }
  private deleteDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hDeviceService.deleteHDevice(this.device.id).subscribe((res) => {
      this.treeHost && this.treeHost.refresh();
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
      // navigate to project page when a device is deleted
      this.router.navigate(['/projects', this.device.project.id]);
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
