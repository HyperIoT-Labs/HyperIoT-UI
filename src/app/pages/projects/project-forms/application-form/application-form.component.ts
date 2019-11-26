import { Component, OnDestroy, ElementRef, ViewChild, Input, Injector, AfterViewInit, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { HdevicesService, HDevice, HProject } from '@hyperiot/core';

import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Validators } from '@angular/forms';

@Component({
  selector: 'hyt-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApplicationFormComponent extends ProjectFormEntity implements AfterViewInit, OnDestroy {
  entity: HDevice = {} as HDevice;
  entityFormMap = {
    'hdevice-devicename': {
      field: 'deviceName'
    },
    'hdevice-description': {
      field: 'description'
    },
    'hdevice-password': {
      field: 'password'
    },
    'hdevice-passwordConfirm': {
      field: 'passwordConfirm'
    }
  };

  id: number; // <-- this could be made private

  @Input()
  currentProject: HProject;

  private routerSubscription: Subscription;
  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hDeviceService: HdevicesService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private i18n: I18n
  ) {
    super(injector, i18n, formView);
    this.longDefinition = this.entitiesService.application.longDefinition;
    this.formTitle = this.entitiesService.application.formTitle;
    this.icon = this.entitiesService.application.icon;
  }

  ngAfterViewInit(): void {

    this.routerSubscription = this.activatedRoute.params.subscribe(params => {
      if (params.deviceId) {
        this.id = params.deviceId;
        this.load();
      } else {
        this.loadEmpty();
      }
      this.cdr.detectChanges();
    });

    //TODO: Replace with Mismatch
    // this.form.get('hdevice-password').valueChanges.subscribe(res => {
    //   const control = this.form.get('hdevice-passwordConfirm')
    //   if (control.hasError('validateInjectedError')) {
    //     control.setErrors({ validateInjectedError: null });
    //     control.updateValueAndValidity();
    //   }
    // });
    // this.form.get('hdevice-passwordConfirm').valueChanges.subscribe(res => {
    //   const control = this.form.get('hdevice-password')
    //   if (control.hasError('validateInjectedError')) {
    //     control.setErrors({ validateInjectedError: null });
    //     control.updateValueAndValidity();
    //   }
    // });
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

  loadEmpty() {
    this.form.reset();
    this.entity = { ...this.entitiesService.device.emptyModel };
    this.edit();
  }

  edit(d?: HDevice, readyCallback?) {
    if (d && d.id) {
      this.form.get('hdevice-password').setValidators([]);
      this.form.get('hdevice-password').updateValueAndValidity();
      this.form.get('hdevice-passwordConfirm').setValidators([]);
      this.form.get('hdevice-passwordConfirm').updateValueAndValidity();
    } else {
      this.form.get('hdevice-password').setValidators([Validators.required]);
      this.form.get('hdevice-password').updateValueAndValidity();
      this.form.get('hdevice-passwordConfirm').setValidators([Validators.required]);
      this.form.get('hdevice-passwordConfirm').updateValueAndValidity();
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

  setErrors(err) {
    console.log(err);

    if (err.error && err.error.type) {
      console.log(err.error.type)
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: 'Unavaiable application name', field: 'hdevice-devicename', invalidValue: '' }]; // @I18N@
          console.log(this.validationError);
          this.form.get('hdevice-devicename').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTScreenNameAlreadyExistsException': {
          this.validationError = [{ message: 'Application name already in use', field: 'hdevice-devicename', invalidValue: '' }]; // @I18N@
          this.form.get('hdevice-devicename').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
          super.setErrors(err);
          break;
        }
        default: {
          this.loadingStatus = LoadingStatusEnum.Error;
        }
      }
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }

  }

}
