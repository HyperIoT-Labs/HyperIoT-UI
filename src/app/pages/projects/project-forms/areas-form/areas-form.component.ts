import { Component, ViewChild, ElementRef, Injector, OnInit, OnDestroy } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Router, ActivatedRoute, Event, NavigationStart } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { AreasService, HprojectsService, Area, AreaDevice } from '@hyperiot/core';
import { AreaMapComponent } from './area-map/area-map.component';
import { HttpClient } from '@angular/common/http';
import { AreaDeviceSelectDialogComponent } from './area-device-select-dialog/area-device-select-dialog.component';
import { AreaInnerareaSelectDialogComponent } from './area-innerarea-select-dialog/area-innerarea-select-dialog.component';

@Component({
  selector: 'hyt-areas-form',
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.scss']
})
export class AreasFormComponent extends ProjectFormEntity implements OnInit {
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
  parentAreaId;
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
    private modalService: HytModalService,
    private httpClient: HttpClient
  ) {
    super(injector, i18n, formView);
    this.formTitle = 'Project Areas'; // @@I18N@@
    this.projectId = this.activatedRoute.snapshot.parent.params.projectId;
    this.areaId = +this.activatedRoute.snapshot.params.areaId;
    this.activatedRoute.params.subscribe(params => {
      this.areaId = +params.areaId;
      this.load();
    });
    router.events.subscribe( (event: Event) => {
      if (event instanceof NavigationStart) {
          if (this.isDirty()) {
            this.currentSection = 0;
          }
      }
    });
  }

  ngOnInit() {
    this.activatedRoute.queryParams
      .subscribe(params => {
        this.parentAreaId = params.parent;
        if (this.parentAreaId) {
          this.entity = { ...this.newEntity() } as Area;
          this.form.reset();
        }
      });
  }

  load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaList = [];
    if (!this.parentAreaId) {
      this.areaPath = [];
    }
    this.showSave = false;
    this.showCancel = false;
    this.hideDelete = true;
    if (this.areaId === 0) {
      this.areaPath.push({ name: 'New', id: 0} as Area);
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
          this.apiSuccess(path);
          this.loadAreaData();
        }, err => this.apiError(err));
      }, err => this.apiError(err));
      this.editMode = true;
      this.showSave = true;
      this.showCancel = false;
      this.hideDelete = false;
    } else {
      this.editMode = false;
      this.projectService.getHProjectAreaList(this.projectId).subscribe((list: Area[]) => {
        this.areaList = list;
        list.forEach((a) => {
          this.countSubAreas(a);
        });
        this.apiSuccess(list);
      }, err => this.apiError(err));
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
    if (this.parentAreaId) {
      this.currentSection = 1; // parent inner area list
      this.router.navigate(
        [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', this.parentAreaId] } } ]
      );
    } else {
      this.router.navigate(
        [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas'] } } ]
      );
    }
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      // TODO: could not find a way of implementing
      //       upload via HyperIoT Area REST API
      //       so it's currently implemented using HttpClient
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
      this.loadingStatus = LoadingStatusEnum.Saving;
      this.httpClient.post(`/hyperiot/areas/${this.areaId}/image`, formData).subscribe((res) => {
        this.entity = res as Area;
        this.apiSuccess(res);
        this.loadAreaImage();
      }, err => this.apiError(err));

    }
  }

  onMapDeviceAddClick(e) {
    const modalRef = this.modalService.open(AreaDeviceSelectDialogComponent, {
      areaId: this.areaId, projectId: this.projectId
    });
    modalRef.onClosed.subscribe(ad => {
      if (ad) {
        this.loadingStatus = LoadingStatusEnum.Saving;
        this.areaService.addAreaDevice(this.areaId, {
          device: ad.device,
          mapInfo: {
            icon: ad.icon,
            x: 0.5,
            y: 0.5
          }
        } as AreaDevice).subscribe((areaDevice: AreaDevice) => {
          this.apiSuccess(areaDevice);
          this.mapComponent.addAreaItem(areaDevice);
        }, err => this.apiError(err));
      }
    });
  }
  onMapDeviceRemoved(areaDevice: AreaDevice) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.removeAreaDevice(this.areaId, areaDevice.id)
      .subscribe(res => this.apiSuccess(res), (err) => this.apiError(err));
  }
  onMapDeviceUpdated(areaDevice: AreaDevice) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.removeAreaDevice(this.areaId, areaDevice.id).subscribe((res) => {
      areaDevice.id = 0;
      // NOTE: 'areaDevice.device.project.user.screenName' property
      //       causes error on the microservices side, so the property
      //       is deleted before updating
      delete areaDevice.device.project.user;
      this.areaService.addAreaDevice(this.areaId, areaDevice).subscribe((ad) => {
        Object.assign(areaDevice, ad);
        this.apiSuccess(ad);
      }, (err) => this.apiError(err));
    }, (err) => this.apiError(err));
  }

  onMapAreaAddClick(e) {
    const modalRef = this.modalService.open(AreaInnerareaSelectDialogComponent, {
      areaId: this.areaId, projectId: this.projectId, areas: this.areaList
    });
    modalRef.onClosed.subscribe(a => {
      if (a) {
        // TODO: the field project should be exposed in model
        // TODO: if not passing this field the service will return validation error
        a['project'] = { id: this.projectId };
        a.parentArea = { id: this.areaId, entityVersion: null };
        a.mapInfo = {
          icon: 'map.png',
          x: 0.5,
          y: 0.5
        };
        this.loadingStatus = LoadingStatusEnum.Saving;
        this.areaService.updateArea(a).subscribe(area => {
          this.mapComponent.addAreaItem(area);
          this.apiSuccess(area);
        }, err => this.apiError(err));
      }
    });
  }
  onMapAreaRemoved(area: Area) {
    area['project'] = { id: this.projectId };
    area.parentArea = { id: this.areaId, entityVersion: null };
    area.mapInfo = null;
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.updateArea(area)
      .subscribe(res => {
        this.apiSuccess(res);
        // update areaList item
        const areaIndex = this.areaList.indexOf(this.areaList.find(a => a.id === area.id));
        if (areaIndex !== -1) {
          this.areaList[areaIndex] = area;
        }
      }, err => this.apiError(err));
  }
  onMapAreaUpdated(area: Area) {
    area['project'] = { id: this.projectId };
    area.parentArea = { id: this.areaId, entityVersion: null };
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.updateArea(area)
      .subscribe(res => this.apiSuccess(res), err => this.apiError(err));
  }

  onEditAreaClick(area) {
    this.currentSection = 0; // show the info tab
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', area.id ] } } ]
    );
  }
  onEditInnerAreaClick(area) {
    this.currentSection = 0; // show the info tab
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', area.id ] } } ]
    );
  }

  onAddInnerAreaClick(e) {
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', 0] } } ],
      { queryParams: { parent: this.areaId } }
    );
  }

  onTabChange(e) {
    if (this.currentSection === 0) {
      this.showSave = true;
      this.hideDelete = this.areaId ? false : true;
    } else {
      this.showSave = false;
      this.showCancel = false;
      this.hideDelete = true;
    }
    if (this.currentSection === 2) {
      this.loadAreaMap();
    }
  }

  private countSubAreas(area: Area) {
    this.areaService.findInnerAreas(area.id).subscribe((areaTree) => {
      const count = (list: Area[]): number => {
        let sum = list.length;
        list.forEach((a) => { sum += count(a.innerArea); });
        return sum;
      };
      area['innerCount'] = count(areaTree.innerArea);
    });
  }

  private loadAreaMap() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.getAreaDeviceList(this.areaId).subscribe((areaDevices: AreaDevice[]) => {
      this.mapComponent.setAreaItems(areaDevices.concat(this.areaList.filter(a => a.mapInfo != null)));
      this.mapComponent.refresh();
      this.loadingStatus = LoadingStatusEnum.Ready;
    });
    if (this.mapComponent.itemOpen.observers.length === 0) {
      this.mapComponent.itemOpen.subscribe((openItem) => {
        if (openItem.device) {
          // TODO: handle device open
        } else {
          this.router.navigate(
            [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', openItem.id ] } } ]
          );
        }
      });
    }
    if (this.mapComponent.itemRemove.observers.length === 0) {
      this.mapComponent.itemRemove.subscribe((removedItem) => {
        if (removedItem.device) {
          this.onMapDeviceRemoved(removedItem);
        } else {
          this.onMapAreaRemoved(removedItem);
        }
      });
    }
    if (this.mapComponent.itemUpdate.observers.length === 0) {
      this.mapComponent.itemUpdate.subscribe((updatedItem) => {
        if (updatedItem.device) {
          this.onMapDeviceUpdated(updatedItem);
        } else {
          this.onMapAreaUpdated(updatedItem);
        }
      });
    }
    this.loadAreaImage();
  }

  private loadAreaImage() {
    if (this.entity.imagePath) {
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
  }

  private getParentAreaId() {
    if (this.areaPath.length > 1) {
      return this.areaPath[this.areaPath.length - 2].id;
    }
  }

  private loadAreaData() {
    // Load inner areas
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.findInnerAreas(this.entity.id).subscribe((areaTree) => {
      this.areaList = areaTree.innerArea;
      this.areaList.forEach((a) => {
        this.countSubAreas(a);
      });
      this.apiSuccess(areaTree);
      if (this.currentSection === 2) {
        this.loadAreaMap();
      }
    }, err => this.apiError(err));
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
        this.apiSuccess(res);
        successCallback && successCallback(res);
      }, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    } else {
      // Add new
      this.areaService.saveArea(area).subscribe((res) => {
        this.resetForm();
        this.apiSuccess(res);
        if (this.parentAreaId) {
          this.currentSection = 1; // show parent inner area list
          this.router.navigate(
            [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', this.parentAreaId] } } ]
          );
        } else {
          this.router.navigate(
            [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', res.id ] } } ]
          );
        }
        successCallback && successCallback(res);
      }, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
  }

  private deleteArea(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    let parentAreaId = this.getParentAreaId();
    this.areaService.deleteArea(this.areaId).subscribe((res) => {
      this.apiSuccess(res);
      successCallback && successCallback(res);
      if (parentAreaId) {
        // navigate back to parent showing inner areas list
        this.currentSection = 1;
        this.router.navigate(
          [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', parentAreaId ] } } ]
        );
      } else {
        // navigate back to main
        this.currentSection = 0;
        this.router.navigate(
          [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas' ] } } ]
        );
      }
    }, (err) => {
      this.apiError(err);
      errorCallback && errorCallback(err);
    });
  }

  private apiSuccess(res) {
    this.loadingStatus = LoadingStatusEnum.Ready;
  }
  private apiError(err) {
    this.loadingStatus = LoadingStatusEnum.Error;
  }
}
