import { Component, OnDestroy, ElementRef, ViewChild } from '@angular/core';
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
export class DeviceDataComponent extends ProjectDetailEntity implements OnDestroy {
  deviceId: number;
  device: HDevice = {} as HDevice;

  private routerSubscription: Subscription;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.deviceId = activatedRoute.snapshot.params.deviceId;
        this.loadDevice();
      }
    });
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
      this.form.get('hdevice-brand')
        .setValue(d.brand);
      this.form.get('hdevice-model')
        .setValue(d.model);
      this.form.get('hdevice-firmwareversion')
        .setValue(d.firmwareVersion);
      this.form.get('hdevice-softwareversion')
        .setValue(d.softwareVersion);
      this.form.get('hdevice-description')
        .setValue(d.description);
      this.resetForm();
      this.treeView().focus({ id: d.id, type: 'device' });
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    let d = this.device;
    d.deviceName = this.form.get('hdevice-devicename').value;
    d.description = this.form.get('hdevice-description').value;
    d.brand = this.form.get('hdevice-brand').value;
    d.model = this.form.get('hdevice-model').value;
    d.firmwareVersion = this.form.get('hdevice-firmwareversion').value;
    d.softwareVersion = this.form.get('hdevice-softwareversion').value;
    this.hDeviceService.updateHDevice(d).subscribe((res) => {
      this.device = d = res;
      this.resetForm();
      this.treeView().updateNode({ id: d.id, type: 'device', name: d.deviceName });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    }, (err) => {
      this.setErrors(err);
      errorCallback && errorCallback(err);
    });
  }
  private deleteDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hDeviceService.deleteHDevice(this.device.id).subscribe((res) => {
      this.treeView().refresh();
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
