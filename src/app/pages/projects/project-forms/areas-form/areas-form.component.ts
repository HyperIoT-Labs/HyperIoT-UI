import { Component, ViewChild, ElementRef, Injector } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Router, ActivatedRoute } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { AreasService, HprojectsService, Area, Attachment, ContentDisposition, HdevicesService, HDevice, AreaDevice } from '@hyperiot/core';
import { AreaMapComponent } from './area-map/area-map.component';
import { HttpClient } from '@angular/common/http';
import { AreaDeviceSelectDialogComponent } from './area-device-select-dialog/area-device-select-dialog.component';
import { AreaInnerareaSelectDialogComponent } from './area-innerarea-select-dialog/area-innerarea-select-dialog.component';

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
    const modalRef = this.modalService.open(AreaDeviceSelectDialogComponent, {
      areaId: this.areaId, projectId: this.projectId
    });
    modalRef.onClosed.subscribe(result => {
      if (result) {
        this.areaService.addAreaDevice(this.areaId, {
          device: result.device,
          mapInfo: {
            icon: result.icon,
            x: 0.5,
            y: 0.5
          }
        } as AreaDevice).subscribe((areaDevice: AreaDevice) => {
          console.log('Add Area Device Result', areaDevice);
          areaDevice.mapInfo.icon = result.icon;
          this.mapComponent.addAreaDeviceItem(areaDevice);
        });
      }
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

  onAreaAddClick(e) {
    const modalRef = this.modalService.open(AreaInnerareaSelectDialogComponent, {
      areaId: this.areaId, projectId: this.projectId, areas: this.areaList
    });
    modalRef.onClosed.subscribe(area => {
      if (area) {
        // TODO: the field project should be exposed in model
        // TODO: if not passing this field the service will return validation error
        area['project'] = { id: this.projectId };
        area.mapInfo = {
          x: 0.5,
          y: 0.5
        };
        // TODO: handle errors
        this.areaService.updateArea(area).subscribe(res => {
          console.log(res);
        });
      }
    });
  }

  onEditInnerAreaClick(area) {
    this.currentSection = 0; // show the info tab
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', area.id ] } } ]
    ).then((success) => {
      // TODO: ?
    });
  }

  onAddInnerAreaClick(e) {
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
      this.currentSection = 0; // show the info tab
      this.router.navigate(
        [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', res.id ] } } ]
      ).then((success) => {
        // TODO: ?
      });
    });
  }

  onTabChange(e) {
    if (this.currentSection === 1) {
      this.loadAreaMap();
    }
  }

  private loadAreaMap() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.getAreaDeviceList(this.areaId).subscribe((res: AreaDevice[]) => {
      this.mapComponent.setDevices(res);
      this.mapComponent.refresh();
      this.loadingStatus = LoadingStatusEnum.Ready;
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

  private getParentAreaId() {
    if (this.areaPath.length > 1) {
      return this.areaPath[this.areaPath.length - 2].id;
    }
  }

  private loadAreaData() {
    // Load inner areas
    this.loadingStatus = LoadingStatusEnum.Loading;
    // TODO: handle errors
    this.areaService.findInnerAreas(this.entity.id).subscribe((areaTree) => {
      this.areaList = areaTree.innerArea;
      this.loadingStatus = LoadingStatusEnum.Ready;
      if (this.currentSection === 1) {
        this.loadAreaMap();
      }
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
    const parentAreaId = this.getParentAreaId();
    area.parentArea = parentAreaId ? { id: parentAreaId, entityVersion: null } : null;
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
    let parentAreaId = this.getParentAreaId();
    this.areaService.deleteArea(this.areaId).subscribe((res) => {
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
      if (parentAreaId) {
        // navigate back to parent showing inner areas list
        this.currentSection = 2;
        this.router.navigate(
          [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', parentAreaId ] } } ]
        ).then((success) => {
          // TODO: ?
        });
      } else {
        // navigate back to main
        this.currentSection = 0;
        this.router.navigate(
          [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas' ] } } ]
        ).then((success) => {
          // TODO: ?
        });
      }
  }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
}
