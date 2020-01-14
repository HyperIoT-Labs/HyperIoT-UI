import { Component, OnInit, ViewChild, ElementRef, Injector } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Router, ActivatedRoute } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { AreasService, HprojectsService, Area, Attachment, ContentDisposition, HdevicesService, HDevice, AreaDevice } from '@hyperiot/core';
import { AreaMapComponent } from './area-map/area-map.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'hyt-areas-form',
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.scss']
})
export class AreasFormComponent extends ProjectFormEntity {
  @ViewChild('map', { static: false })
  mapComponent: AreaMapComponent;

  entity = {} as Area;
  entityFormMap = {
    'area-name': {
      field: 'name'
    },
    'area-description': {
      field: 'description'
    },
    'area-image': {
      field: 'imagePath'
    }
  };

  projectId: number;
  areaId = 0;
  currentSection = 0;
  areaList: Area[] = [];
  areaPath: Area[] = [];

  projectDevices: {label: string, value: any}[] = [];
  selectedDevice: HDevice;

  deviceIconOptions = [
    { label: 'Motion Sensor', value: 'motion-sensor.png' },
    { label: 'Wind Sensor', value: 'wind-sensor.png' },
    { label: 'Body Scanner', value: 'body-scanner.png' },
    { label: 'Door Sensor', value: 'door-sensor.png' },
    { label: 'GPS Sensor', value: 'gps-sensor.png' },
    { label: 'Automated Light', value: 'light.png' },
    { label: 'Rain Sensor', value: 'rain-sensor.png' },
    { label: 'RFID Sensor', value: 'rfid.png' },
    { label: 'Thermometer', value: 'thermometer.png' }
  ];
  selectedDeviceIcon: string;

  constructor(
    injector: Injector,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private i18n: I18n,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private areaService: AreasService,
    private projectService: HprojectsService,
    private deviceService: HdevicesService,
    private modalService: HytModalService,
    private httpClient: HttpClient
  ) {
    super(injector, i18n, formView);
    this.formTitle = 'Project Areas';
    this.projectId = this.activatedRoute.snapshot.parent.params.projectId;
    this.areaId = +this.activatedRoute.snapshot.params.areaId;
    this.activatedRoute.params.subscribe(params => {
      this.areaId = +params.areaId;
      this.load();
    });
  }

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.currentSection = 0;
    this.areaList = [];
    this.areaPath = [];
    this.showSave = false;
    this.showCancel = false;
    this.hideDelete = true;
    if (this.areaId === 0) {
      setTimeout(() => {
        this.resetForm();
        this.loadingStatus = LoadingStatusEnum.Ready;
      }, 500);
      this.editMode = true;
      this.showSave = true;
      this.showCancel = true;
      this.hideDelete = true;
    } else if (this.areaId > 0) {
      this.areaService.findArea(this.areaId).subscribe((area) => {
        this.edit(area);
        this.areaService.getAreaPath(this.areaId).subscribe((path) => {
          this.areaPath = path;
          this.loadingStatus = LoadingStatusEnum.Ready;
          this.loadAreaData();
        });
      });
      this.editMode = true;
      this.showSave = true;
      this.showCancel = false;
      this.hideDelete = false;
    } else {
      this.editMode = false;
      this.projectService.getHProjectAreaList(this.projectId).subscribe((list) => {
        this.areaList = list;
        this.loadingStatus = LoadingStatusEnum.Ready;
      });
    }
  }
  save(successCallback: any, errorCallback: any) {
    this.saveArea(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deleteArea(successCallback, errorCallback);
  }
  cancel() {
    this.resetForm();
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas'] } } ]
    ).then((success) => {
      // TODO: ?
    });
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      /*
      const reader = new FileReader();
      reader.onload = () => {
        console.log(file, reader);
        // TODO: set image
        const body = {
          contentDisposition: {
            filename: file.name,
            type: file.type
          } as ContentDisposition,
          object: reader.result,
          dataHandler: (test) => {
            console.log(test);
          }
        } as Attachment;
        this.areaService.setAreaImage(this.areaId, body).subscribe((res) => {
          console.log(res);
        });
      };
      reader.readAsDataURL(file);
      */
      //this.areaService.setAreaImage(this.areaId, file).subscribe((res) => {
      //  console.log(res);
      //});

      //this.mapComponent.setMapImage(null);

      const formData = new FormData();
      formData.append('image_file', file, file.name);
      this.httpClient.post(`/hyperiot/areas/${this.areaId}/image`, formData).subscribe((res) => {
        this.loadAreaImage();
      });

    }
  }

  onDeviceAddClick(e) {
    this.areaService.addAreaDevice(this.areaId, {
      device: this.selectedDevice,
      icon: this.selectedDeviceIcon,
      x: 0.5,
      y: 0.5
    } as AreaDevice).subscribe((areaDevice: AreaDevice) => {
      console.log('Add Area Device Result', areaDevice);
      areaDevice.icon = this.selectedDeviceIcon;
      this.mapComponent.addAreaDeviceItem(areaDevice);
    });
  }
  onMapDeviceRemoved(removedItem: AreaDevice) {
    // TODO: handle errors
    this.areaService.removeAreaDevice(this.areaId, removedItem.id).subscribe((res) => {
      console.log('Removed item', res);
    });
  }
  onMapDeviceUpdated(updatedItem: AreaDevice) {
    // TODO: handle errors
    this.areaService.removeAreaDevice(this.areaId, updatedItem.id).subscribe((res) => {
      updatedItem.id = 0;
      // NOTE: 'updatedItem.device.project.user.screenName' property
      //       causes error on the microservices side, so the property
      //       is deleted before updating
      delete updatedItem.device.project.user;
      this.areaService.addAreaDevice(this.areaId, updatedItem).subscribe((ad) => {
        Object.assign(updatedItem, ad);
      });
    });
  }

  onAddSubAreaClick(e) {
    const a: Area = {
      id: 0,
      name: 'New area ' + new Date().getTime(),
      description: 'New area description',
      parentArea: { id: this.areaId, entityVersion: null },
      entityVersion: null
    };
    // TODO:
    // TODO: the 'project' field should be exposed in Area model by REST API
    // TODO:
    a['project'] = { id: this.projectId };
    this.areaService.saveArea(a).subscribe(res => {
      this.router.navigate(
        [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', res.id ] } } ]
      ).then((success) => {
        // TODO: ?
      });
    });
  }

  onTabChange(e) {
    if (this.currentSection === 1) {
      // TODO: load map config and refresh map
      this.areaService.getAreaDeviceList(this.areaId).subscribe((res: AreaDevice[]) => {
        this.mapComponent.setDevices(res);
        this.mapComponent.refresh();
      });
      if (this.mapComponent.itemRemove.observers.length === 0) {
        this.mapComponent.itemRemove.subscribe((removedItem) => {
          this.onMapDeviceRemoved(removedItem);
        });
      }
      if (this.mapComponent.itemUpdate.observers.length === 0) {
        this.mapComponent.itemUpdate.subscribe((updatedItem) => {
          this.onMapDeviceUpdated(updatedItem);
        });
      }
      this.loadAreaImage();
    }
  }

  private loadAreaImage() {
    //this.areaService.getAreaImage(this.areaId).subscribe((res) => {
    //});
    this.httpClient.get(`/hyperiot/areas/${this.areaId}/image`, {
      responseType: 'blob'
    }).subscribe((res: Blob) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          this.mapComponent.setMapImage(`/hyperiot/areas/${this.areaId}/image?` + (new Date().getTime()), img.width, img.height);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(res);
    });
  }

  private loadAreaData() {
    // Load inner areas
    this.loadingStatus = LoadingStatusEnum.Loading;
    // TODO: handle errors
    this.areaService.findInnerAreas(this.entity.id).subscribe((areaTree) => {
      this.areaList = areaTree.innerArea;
      this.loadingStatus = LoadingStatusEnum.Ready;
      // load prject devices
      this.loadProjectDevices();
    });
  }

  private loadProjectDevices() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    // TODO: handle errors
    this.deviceService.findAllHDeviceByProjectId(this.projectId).subscribe((res) => {
      this.projectDevices = res.map((d: HDevice) => ({
        label: d.deviceName,
        value: d
      }));
      this.loadingStatus = LoadingStatusEnum.Ready;
    });
  }

  private saveArea(successCallback: any, errorCallback: any) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    const area = this.entity;
    area.name = this.form.get('area-name').value;
    area.description = this.form.get('area-description').value;
    // TODO: the field project should be exposed in model
    // TODO: if not passing this field the service will return validation error
    area['project'] = { id: this.projectId };
    area.parentArea = null;
    if (this.areaPath.length > 1) {
      const parentAreaId = this.areaPath[this.areaPath.length - 2].id;
      area.parentArea = { id: parentAreaId, entityVersion: null };
    }
    if (area.id) {
      // Update existing
      this.areaService.updateArea(area).subscribe((res) => {
        this.entity = res;
        this.resetForm();
        this.areaService.getAreaPath(res.id).subscribe((path) => {
          this.areaPath = path;
        });
        this.loadingStatus = LoadingStatusEnum.Ready;
        successCallback && successCallback(res);
      }, (err) => {
        this.loadingStatus = LoadingStatusEnum.Error;
        errorCallback && errorCallback(err);
      });
    } else {
      // Add new
      this.areaService.saveArea(area).subscribe((res) => {
        this.resetForm();
        this.router.navigate(
          [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', res.id ] } } ]
        ).then((success) => {
          // TODO: ?
        });
        this.loadingStatus = LoadingStatusEnum.Ready;
        successCallback && successCallback(res);
      }, (err) => {
        this.loadingStatus = LoadingStatusEnum.Error;
        errorCallback && errorCallback(err);
      });
    }
  }

  private deleteArea(successCallback, errorCallback) {
    // TODO: ....
    this.areaService.deleteArea(this.areaId).subscribe((res) => {
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
