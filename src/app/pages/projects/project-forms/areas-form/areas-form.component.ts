import { Component, ViewChild, ElementRef, Injector, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationStart } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { AreasService, HprojectsService, Area, AreaDevice } from '@hyperiot/core';
import { AreaMapComponent } from './area-map/area-map.component';
import { HttpClient } from '@angular/common/http';
import { AreaDeviceSelectDialogComponent } from './area-device-select-dialog/area-device-select-dialog.component';
import { AreaInnerareaSelectDialogComponent } from './area-innerarea-select-dialog/area-innerarea-select-dialog.component';
import { DraggableItemComponent } from './draggable-item/draggable-item.component';
import { GenericMessageDialogComponent } from 'src/app/components/modals/generic-message-dialog/generic-message-dialog.component';

@Component({
  selector: 'hyt-areas-form',
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.scss']
})
export class AreasFormComponent extends ProjectFormEntity implements OnInit {
  @ViewChild('map')
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

  allowedImageTypes = ['.jpg','.jpeg','.png','.svg']; 
  acceptFiles = this.allowedImageTypes.join(",").replace(/\./,"image/");
  maxFileSize = 0; // this will be set in constructor via areaService.getConfig()...

  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private areaService: AreasService,
    private projectService: HprojectsService,
    private modalService: HytModalService,
    private httpClient: HttpClient
  ) {
    super(injector);
    this.formTemplateId = 'container-areas-form';
    this.formTitle = $localize`:@@HYT_project_areas:Project Areas`;
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
    // Get Area Service configuration
    this.areaService.getConfig().subscribe((res) => {
      if (res && res.maxFileSize > 0) {
        this.maxFileSize = +res.maxFileSize;
      } else {
        // TODO: maybe report a message ("Could not get Area service config")
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
      // Add New Area
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
      // Load Area with id = this.areaId
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
      // Show Area list
      this.editMode = false;
      this.projectService.getHProjectAreaList(this.projectId).subscribe((list: Area[]) => {
        this.areaList = list;
        list.forEach((a) => {
          this.countAreaItems(a);
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
      const fileName = (file.name as string);
      const extension = fileName.substr(fileName.lastIndexOf('.')).toLocaleLowerCase();
      // reset file input
      event.target.value = '';
      // if file type is allowed, continue reading and uploading file
      if (this.allowedImageTypes.indexOf(extension) >= 0) {

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

        this.loadingStatus = LoadingStatusEnum.Saving;
        // check image file size on the client side before effective upload
        const reader = new FileReader();
        reader.onload = (e) => {
          const kiloBytesLength = file.size;
          // Check if `kiloBytesLength` does not exceed the maximum allowed size
          if (kiloBytesLength <= this.maxFileSize) {
            // TODO: using standard HttpClient for this request (see early comment in this method)
            const formData = new FormData();
            formData.append('image_file', file, file.name);
            this.httpClient.post(`/hyperiot/areas/${this.areaId}/image`, formData).subscribe((res) => {
              this.entity = res as Area;
              this.apiSuccess(res);
              this.loadAreaImage();
            }, err => {
              if (err.error && err.error.errorMessages) {
                this.modalService.open(GenericMessageDialogComponent, {
                  message: err.error.errorMessages[0]
                });
                this.loadingStatus = LoadingStatusEnum.Ready;
              } else {
                this.apiError(err);
              }
            });
          } else {
            this.modalService.open(GenericMessageDialogComponent, {
              message: $localize`:@@HYT_file_size_exceed:File size exceed limit of ${this.maxFileSize} bytes`
            });
            this.loadingStatus = LoadingStatusEnum.Ready;
          }
        };
        reader.readAsDataURL(file);
      } else {
        // wrong file type
        this.modalService.open(GenericMessageDialogComponent, {
          message: $localize`:@@HYT_file_type_must_be:File type must be ${this.allowedImageTypes.join(', ')}`
        });
      }
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
        a.mapInfo = {
          icon: 'map.png',
          x: 0.5,
          y: 0.5
        };
        this.loadingStatus = LoadingStatusEnum.Saving;
        this.areaService.updateArea(this.patchArea(a)).subscribe(area => {
          Object.assign(a, area);
          this.mapComponent.addAreaItem(a);
          this.apiSuccess(area);
        }, err => this.apiError(err));
      }
    });
  }
  onMapAreaRemoved(area: Area) {
    area.mapInfo = null;
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.updateArea(this.patchArea(area))
      .subscribe(res => {
        this.apiSuccess(res);
        // update areaList item
        const areaIndex = this.areaList.indexOf(this.areaList.find(a => a.id === area.id));
        if (areaIndex !== -1) {
          Object.assign(this.areaList[areaIndex], area);
        }
      }, err => this.apiError(err));
  }
  onMapAreaUpdated(area: Area) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.updateArea(this.patchArea(area))
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
      this.loadAreaData();
    }
  }

  private countAreaItems(area: Area) {
    this.areaService.findInnerAreas(area.id).subscribe((areaTree) => {
      const count = (list: Area[]): number => {
        let sum = list.length;
        list.forEach((a) => { sum += count(a.innerArea); });
        return sum;
      };
      area['innerCount'] = count(areaTree.innerArea);
      // get all devices (including inner areas ones)
      this.areaService.getAreaDeviceDeepList(area.id).subscribe((deviceList) => {
        area['deviceCount'] = deviceList.length;
      });
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
        if (openItem.device) { // item is a device
          // TODO: handle device open
        } else { // item is an area
          this.router.navigate(
            [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', openItem.id ] } } ]
          );
        }
      });
    }
    if (this.mapComponent.itemRemove.observers.length === 0) {
      this.mapComponent.itemRemove.subscribe((removedItem) => {
        if (removedItem.device) { // item is a device
          this.onMapDeviceRemoved(removedItem);
        } else { // item is an area
          this.onMapAreaRemoved(removedItem);
        }
      });
    }
    if (this.mapComponent.itemUpdate.observers.length === 0) {
      this.mapComponent.itemUpdate.subscribe((updatedItem) => {
        if (updatedItem.device) { // item is a device
          this.onMapDeviceUpdated(updatedItem);
        } else { // item is an area
          this.onMapAreaUpdated(updatedItem);
        }
      });
    }
    if (this.mapComponent.renderDataRequest.observers.length === 0) {
      this.mapComponent.renderDataRequest.subscribe((draggableItem: DraggableItemComponent) => {
        if (!draggableItem.itemData.device) { // item is an Area
          const a = this.areaList.find((area) => area === draggableItem.itemData) as any;
          draggableItem.renderData.deviceCount = a.deviceCount;
        }
      });
    }
    this.loadAreaImage();
  }

  private loadAreaImage() {
    this.mapComponent.unsetMapImage();
    if (this.entity.imagePath) {
      // TODO: no way to make this work with Area API
      //this.areaService.getAreaImage(this.areaId).subscribe((res) => {
      //});
      // TODO: using standard HttpClient for this request
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

  private patchArea(a: Area): Area {
    const area = {} as Area;
    Object.assign(area, a); // clone
    // TODO: the field project should be exposed in model
    // TODO: if not passing this field the service will return validation error
    area['project'] = { id: this.projectId };
    area.parentArea = { id: this.areaId, entityVersion: null };
    delete area['innerCount'];
    delete area['deviceCount'];
    return area;
  }

  private loadAreaData() {
    // Load inner areas
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.findInnerAreas(this.entity.id).subscribe((areaTree) => {
      this.areaList = areaTree.innerArea;
      this.areaList.forEach((a) => {
        this.countAreaItems(a);
      });
      this.apiSuccess(areaTree);
      if (this.currentSection === 2) {
        this.loadAreaMap();
      }
    }, err => this.apiError(err));
  }

  private saveArea(successCallback: any, errorCallback: any) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    let area = this.entity;
    area.name = this.form.get('area-name').value;
    area.description = this.form.get('area-description').value;
    area = this.patchArea(area);
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
