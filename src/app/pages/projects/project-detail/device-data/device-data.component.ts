import { Component, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HdevicesService, HDevice, HProject } from '@hyperiot/core';

import { ProjectDetailEntity, LoadingStatusEnum, SubmitMethod } from '../project-detail-entity';

@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent extends ProjectDetailEntity implements OnDestroy {

  @Input()
  currentProject: HProject;

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
    this.longDefinition = 'device long definition';//@I18N@
    this.routerSubscription = this.router.events.subscribe((rl) => {
      this.submitMethod = SubmitMethod.Put;
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
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: d.id, type: 'device'
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    const responseHandler = (res) => {
      this.device = res;
      if (this.submitMethod == SubmitMethod.Post)
        this.cleanForm();
      else
        this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: this.device.id,
        type: 'device',
        name: this.device.deviceName
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    };

    if (this.submitMethod == SubmitMethod.Post) {
      let d: HDevice = {
        entityVersion: 1,
        deviceName: this.form.get('hdevice-devicename').value,
        description: this.form.get('hdevice-description').value,
        brand: this.form.get('hdevice-brand').value,
        model: this.form.get('hdevice-model').value,
        firmwareVersion: this.form.get('hdevice-firmwareversion').value,
        softwareVersion: this.form.get('hdevice-softwareversion').value,
        password: this.form.value['hdevice-password'],
        passwordConfirm: this.form.value['hdevice-passwordConfirm'],
        project: { id: this.currentProject.id, entityVersion: this.currentProject.entityVersion }
      }
      this.hDeviceService.saveHDevice(d).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
    else {
      let d = this.device;
      d.deviceName = this.form.get('hdevice-devicename').value;
      d.description = this.form.get('hdevice-description').value;
      d.brand = this.form.get('hdevice-brand').value;
      d.model = this.form.get('hdevice-model').value;
      d.firmwareVersion = this.form.get('hdevice-firmwareversion').value;
      d.softwareVersion = this.form.get('hdevice-softwareversion').value;
      this.hDeviceService.updateHDevice(d).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }

  }
  private deleteDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hDeviceService.deleteHDevice(this.device.id).subscribe((res) => {
      this.entityEvent.emit({ event: 'treeview:refresh' });
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
      // request navigate to project page when a device is deleted
      this.entityEvent.emit({
        event: 'entity:delete',
        exitRoute: ['/projects', this.device.project.id]
      });
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
