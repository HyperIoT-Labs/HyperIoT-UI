import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';

import { HdevicesService, HDevice } from '@hyperiot/core';

import { ProjectDetailComponent } from '../project-detail.component';
import { ProjectDetailEntity } from '../project-detail-entity';

enum LoadingStatusEnum {
  Ready,
  Loading,
  Saving,
  Error
}
@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent implements ProjectDetailEntity, OnInit, OnDestroy {
  deviceId: number;
  device: HDevice = {} as HDevice;

  form: FormGroup;
  originalValue: string;

  LoadingStatus = LoadingStatusEnum;
  loadingStatus = LoadingStatusEnum.Ready;

  // ProjectDetailEntity interface
  isProjectEntity = true;
  treeHost: ProjectDetailComponent = null;

  private routerSubscription: Subscription;

  constructor(
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({});
    this.originalValue = JSON.stringify(this.form.value);
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

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.treeHost.openSaveDialog();
    }
    return true;
  }

  // ProjectDetailEntity interface
  save(successCallback, errorCallback) {
    this.saveDevice(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deleteDevice(successCallback, errorCallback);
  }
  isValid(): boolean {
    return this.form.valid;
  }
  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }

  private loadDevice() {
    this.loadingStatus = LoadingStatusEnum.Loading;
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
      this.treeHost.focus({id: d.id, type: 'device'});
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    let d = this.device;
    d.deviceName = this.form.get('name').value;
    d.description = this.form.get('description').value;
    d.brand = this.form.get('brand').value;
    d.model = this.form.get('model').value;
    d.firmwareVersion = this.form.get('firmware').value;
    d.softwareVersion = this.form.get('software').value;
    this.hDeviceService.updateHDevice(d).subscribe((res) => {
      this.device = d = res;
      this.originalValue = JSON.stringify(this.form.value);
      this.treeHost && this.treeHost.updateNode({id: d.id, type: 'device', name: d.deviceName});
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
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
