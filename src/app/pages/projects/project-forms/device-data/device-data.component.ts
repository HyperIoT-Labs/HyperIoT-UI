import { Component, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { HdevicesService, HDevice, HProject } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';

@Component({
  selector: 'hyt-device-data',
  templateUrl: './device-data.component.html',
  styleUrls: ['./device-data.component.scss']
})
export class DeviceDataComponent extends ProjectFormEntity implements OnDestroy {
  entity: HDevice = {} as HDevice;
  entityFormMap = {
    'hdevice-devicename': 'deviceName',
    'hdevice-brand': 'brand',
    'hdevice-model': 'model',
    'hdevice-firmwareversion': 'firmwareVersion',
    'hdevice-softwareversion': 'softwareVersion',
    'hdevice-description': 'description'
  };

  id: number; // <-- this could be made private

  @Input()
  currentProject: HProject;

  private routerSubscription: Subscription;
  constructor(
    public formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'device long definition';//@I18N@
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.id = activatedRoute.snapshot.params.deviceId;
        this.load();
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

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hDeviceService.findHDevice(this.id).subscribe((d: HDevice) => {
      this.entity = d;
      // update form data
      this.edit();
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: d.id, type: 'device'
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  clone(entity?: HDevice): HDevice {
    const device = {...entity} || this.entity;
    device.id = 0;
    device.entityVersion = 1;
    device.deviceName = `${device.deviceName}Copy`;
    this.edit(device);
    return device;
}

  private saveDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    let d = this.entity;
    d.deviceName = this.form.get('hdevice-devicename').value;
    d.description = this.form.get('hdevice-description').value;
    d.brand = this.form.get('hdevice-brand').value;
    d.model = this.form.get('hdevice-model').value;
    d.firmwareVersion = this.form.get('hdevice-firmwareversion').value;
    d.softwareVersion = this.form.get('hdevice-softwareversion').value;

    const responseHandler = (res) => {
      this.entity = res;
      this.resetForm();
      this.entityEvent.emit({
        event: 'treeview:update',
        id: this.entity.id,
        type: 'device',
        name: this.entity.deviceName
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    };

    if (d.id) {
      this.hDeviceService.updateHDevice(d).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
    else {
      d.entityVersion = 1;
      d.password = this.form.value['hdevice-password'];
      d.passwordConfirm = this.form.value['hdevice-passwordConfirm'];
      d.project = { id: this.currentProject.id, entityVersion: this.currentProject.entityVersion };
      this.hDeviceService.saveHDevice(d).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }

  }
  private deleteDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hDeviceService.deleteHDevice(this.entity.id).subscribe((res) => {
      this.entityEvent.emit({ event: 'treeview:refresh' });
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
      // request navigate to project page when a device is deleted
      this.entityEvent.emit({
        event: 'entity:delete',
        exitRoute: ['/projects', this.entity.project.id]
      });
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
