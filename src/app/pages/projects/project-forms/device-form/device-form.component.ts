import { Component, OnDestroy, ElementRef, ViewChild, Input, Injector } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { HdevicesService, HDevice, HProject } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-device-form',
  templateUrl: './device-form.component.html',
  styleUrls: ['./device-form.component.scss']
})
export class DeviceFormComponent extends ProjectFormEntity implements OnDestroy {
  entity: HDevice = {} as HDevice;
  entityFormMap = {
    'hdevice-devicename': {
      field: 'deviceName',
      default: null
    },
    'hdevice-brand': {
      field: 'brand',
      default: null
    },
    'hdevice-model': {
      field: 'model',
      default: null
    },
    'hdevice-firmwareversion': {
      field: 'firmwareVersion',
      default: null
    },
    'hdevice-softwareversion': {
      field: 'softwareVersion',
      default: null
    },
    'hdevice-description': {
      field: 'description',
      default: null
    }
  };
  formTitle = 'Device';

  id: number; // <-- this could be made private

  @Input()
  currentProject: HProject;

  private routerSubscription: Subscription;
  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18n
  ) {
    super(injector, formView);
    this.longDefinition = this.i18n('HYT_device_long_definition');
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.id = activatedRoute.snapshot.params.deviceId;
        this.load();
      }
    });
  }

  ngAfterViewInit() {
    //TODO: Replace with Mismatch
    this.form.get('hdevice-password').valueChanges.subscribe(res => {
      let control = this.form.get('hdevice-passwordConfirm')
      if (control.hasError('validateInjectedError')) {
        control.setErrors({ validateInjectedError: null });
        control.updateValueAndValidity();
      }
    });
    this.form.get('hdevice-passwordConfirm').valueChanges.subscribe(res => {
      let control = this.form.get('hdevice-password')
      if (control.hasError('validateInjectedError')) {
        control.setErrors({ validateInjectedError: null });
        control.updateValueAndValidity();
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
      // update form data
      this.edit(d);
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: d.id, type: 'device'
      });
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
  edit(d?: HDevice, readyCallback?) {
    // TODO: verify this...
    if (d && d.id) {
      this.form.removeControl('hdevice-password');
      this.form.removeControl('hdevice-passwordConfirm');
    } else {
      //this.form.addControl('hdevice-password');
      //this.form.removeControl('hdevice-passwordConfirm');
    }
    super.edit(d, readyCallback);
  }
  clone(entity?: HDevice): HDevice {
    const device = { ...entity } || this.entity;
    device.id = 0;
    device.entityVersion = 1;
    device.deviceName = `${device.deviceName}Copy`;
    this.edit(device);
    return device;
  }

  private saveDevice(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    const d = this.entity;
    d.deviceName = this.form.get('hdevice-devicename').value;
    d.description = this.form.get('hdevice-description').value;
    d.brand = this.form.get('hdevice-brand').value;
    d.model = this.form.get('hdevice-model').value;
    d.firmwareVersion = this.form.get('hdevice-firmwareversion').value;
    d.softwareVersion = this.form.get('hdevice-softwareversion').value;

    const wasNew = this.isNew();
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
      successCallback && successCallback(res, wasNew);
    };

    if (d.id) {
      this.hDeviceService.updateHDevice(d).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    } else {
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
      this.loadingStatus = LoadingStatusEnum.Ready;
      // request navigate to project page when a device is deleted
      this.entityEvent.emit({
        event: 'entity:delete',
        //exitRoute: ['/projects', this.entity.project.id]
      });
      successCallback && successCallback(res);
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
