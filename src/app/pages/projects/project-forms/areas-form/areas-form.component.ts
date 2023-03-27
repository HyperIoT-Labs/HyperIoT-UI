/*
 *
 *  * Copyright 2019-2023 HyperIoT
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License")
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *  *
 *
 */

import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Event, NavigationStart, Router} from '@angular/router';
import {HytModalService, Option} from '@hyperiot/components';
import {LoadingStatusEnum, ProjectFormEntity} from '../project-form-entity';
import {Area, AreaDevice, AreasService, HprojectsService, Logger, LoggerService} from '@hyperiot/core';
import {AreaMapComponent} from './area-map/area-map.component';
import {HttpClient} from '@angular/common/http';
import {AreaDeviceSelectDialogComponent} from './area-device-select-dialog/area-device-select-dialog.component';
import {AreaInnerareaSelectDialogComponent} from './area-innerarea-select-dialog/area-innerarea-select-dialog.component';
import {DraggableItemComponent} from './draggable-item/draggable-item.component';
import {GenericMessageDialogComponent} from 'src/app/components/modals/generic-message-dialog/generic-message-dialog.component';
import {mergeMap, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'hyt-areas-form',
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreasFormComponent extends ProjectFormEntity implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Listener on map area
   */
  @ViewChild('map')
  mapComponent: AreaMapComponent;
  /**
   * Item used to copy and manipulate the current area object
   */
  entity = {} as Area;
  /**
   * Object used to map the area form elements
   */
  entityFormMap = {
    'area-name': {
      field: 'name'
    },
    'area-description': {
      field: 'description'
    },
    'area-type': {
      field: 'areaViewType'
    }
  };
  /**
   * Id of the current project
   */
  projectId: number;
  /**
   * ID of the current area
   */
  areaId = 0;
  /**
   * Id of the Parent area element
   */
  parentAreaId;
  /**
   * Id of the active tab element
   */
  currentSection = 0;
  /**
   * List of the area object for this project
   */
  areaList: Area[] = [];
  /**
   * List of the area path
   */
  areaPath: Area[] = [];
  /**
   * Allowed extensions type for area image
   */
  allowedImageTypes = ['.jpg','.jpeg','.png','.svg', '.webp'];
  acceptFiles = this.allowedImageTypes.join(',').replace(/\./,'image/');
  maxFileSize = 1000000;
  overlayLoadingString = $localize`:@@HYT_loading_area_media:Loading Area Media`;
  ovelayErrorString = $localize`:@@HYT_loading_media_error:Loading Media Error`;
  overlayEmptyString = $localize`:@@HYT_no_area_media:No Media`;
  /*
   * logger service
   */
  private logger: Logger;
  /**
   * Subject for manage the open subscriptions
   * @protected
   */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  /**
   * Output event on click of the creation/modification tab of an area
   */
  @Output() clickedTab: EventEmitter<any> = new EventEmitter();
  /**
   * Object that contains the different types of area to be displayed in the TYPE field of the form
   */
  fieldAreaTypeOptions: Option[] = Object.keys(Area.AreaViewTypeEnum)
    .map((k) => {
      switch (k) {
        case 'IMAGE':
          return {label: $localize`:@@HYT_project_areas_static_image:STATIC IMAGE`, value: k}
        case 'MAP':
          return {label: $localize`:@@HYT_project_areas_dynamic_map:DYNAMIC MAP`, value: k, disabled: true}
        case 'BIMXKT':
          return {label: $localize`:@@HYT_project_areas_bim_xkt_format:BIM IN XKT FORMAT`, value: k, disabled: true}
        case 'BIMIFC':
          return {label: $localize`:@@HYT_project_areas_bim_ifc_format:BIM IN IFC FORMAT`, value: k, disabled: true}
      }
    });

  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private areaService: AreasService,
    private projectService: HprojectsService,
    private modalService: HytModalService,
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private loggerService: LoggerService
  ) {
    super(injector,cdr);
    this.formTemplateId = 'container-areas-form';
    this.formTitle = $localize`:@@HYT_project_areas:Project Areas`;
    this.projectId = this.activatedRoute.snapshot.parent.params.projectId;
    this.areaId = +this.activatedRoute.snapshot.params.areaId;
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AreaFormComponent');
    // Get Area Service configuration
    this.areaService.getConfig()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((conf) => {
        if (conf && conf.maxFileSize > 0) {
          this.maxFileSize = +conf.maxFileSize;
          this.logger.debug('Configuration Max File Size', this.maxFileSize);
        } else {
          this.logger.warn('The configuration does not contain the maximum size parameter of the file to upload', conf);
        }
    });
  }

  ngOnInit() {

    this.activatedRoute.queryParams
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(params => {
      this.parentAreaId = params.parent;
      if (this.parentAreaId) {
        this.entity = { ...this.newEntity() } as Area;
        this.form.reset();
      }
    });

    this.activatedRoute.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.areaId = +params.areaId;
        this.load();
      }
    );
    this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe( (event: Event) => {
      if (event instanceof NavigationStart) {
          if (this.isDirty()) {
            this.currentSection = 0;
          }
      }
    });

  }

  ngAfterViewInit() {
    this.clickedTab.emit('Tab-Info');
  }

  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  /**
   * Function for uploading all data concerning the area
   */
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
      this.cdr.detectChanges();
      this.resetForm();
      this.loadingStatus = LoadingStatusEnum.Ready;
      this.editMode = true;
      this.showSave = true;
      this.showCancel = true;
      this.hideDelete = true;
    } else if (this.areaId > 0) {
      // Load Area with id
      this.areaService.findArea(this.areaId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((area) => {
        this.logger.debug('load - find area by id', this.areaId, area);
        this.edit(area);
        this.areaService.getAreaPath(this.areaId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((path) => {
          this.logger.debug('load - get area path by id', this.areaId, path);
          this.areaPath = path;
          this.apiSuccess(path);
          this.loadAreaData();
        },
  (err) => {
          this.logger.error('When loading the area, the search for the path failed', err);
          this.apiError(err);
        });
      },
      (err) => {
          this.logger.error('Area search by ID failed', err);
          this.apiError(err);
      });
      this.editMode = true;
      this.showSave = true;
      this.showCancel = false;
      this.hideDelete = false;
    } else {
      // Show Area list
      this.editMode = false;
      this.projectService.getHProjectAreaList(this.projectId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((list: Area[]) => {
        this.logger.debug('load - HProject area list by id', this.projectId, list);
        this.areaList = list;
        list.forEach((a) => {
          this.countAreaItems(a);
        });
        this.apiSuccess(list);
      }, (err) => {
          this.logger.error('oad - HProject area list by id Error', this.projectId, err);
          this.apiError(err);
        });
    }
  }

  /**
   * Generic function to save area data with the possibility to set a callback function
   * @param successCallback
   * @param errorCallback
   */
  save(successCallback: any, errorCallback: any) {
    this.logger.debug('Save start');
    this.saveArea(successCallback, errorCallback);
  }

  /**
   * Generic function to delete area data with the possibility to set a callback function
   * @param successCallback
   * @param errorCallback
   */
  delete(successCallback, errorCallback) {
    this.logger.debug('Delete start');
    this.deleteArea(successCallback, errorCallback);
  }

  /**
   * Function used to reset the area form values and reload the element
   */
  cancel() {
    this.logger.debug('Cancel start');
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

  returnToAreaProjectDetails(): void {
    this.logger.debug('returnToAreaProjectDetails start');
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas'] } } ]
    );
  }

  /**
   * Saving a background image of the area on the file system
   * @param event
   */
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
        /*this.areaService.setAreaImage(this.areaId, file).subscribe((res) => {
          console.log(res);
        });*/
        // this.mapComponent.setMapImage(null);

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
            const imageConfiguration = {
              imageInfo: {
                name: file.name,
                ext: fileName.substr(fileName.lastIndexOf('.')).toLocaleLowerCase(),
                size: file.size
              }
            }
            // Updated Area model
            const stringifyProjectId = this.projectId as unknown;
            const newArea = {
              ...this.entity,
              areaConfiguration: JSON.stringify(imageConfiguration),
              project: { id: stringifyProjectId as string }
            }
            const parentAreaId = this.getParentAreaId();
            newArea.parentArea = parentAreaId ? { id: parentAreaId, entityVersion: null } : null;

            const uploadImage = this.areaService.updateArea(newArea).pipe(
              mergeMap((imageRes) => this.httpClient.post(`/hyperiot/areas/${newArea.id}/image`, formData))
            );

            uploadImage
              .pipe(takeUntil(this.ngUnsubscribe))
              .subscribe({
              next: (res) => {
                this.logger.debug('Upload image response', res);
                this.entity = res as Area;
                this.apiSuccess(res);
                this.loadAreaImage();
              },
              error: (err) => {
                this.logger.error('Upload image Error', err);
                if (err.error && err.error.errorMessages) {
                  this.modalService.open(GenericMessageDialogComponent, {
                    message: err.error.errorMessages[0]
                  });
                  this.loadingStatus = LoadingStatusEnum.Ready;
                } else {
                  this.apiError(err);
                }
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

  /**
   * Adding a device to the area map
   * @param e
   */
  onMapDeviceAddClick(e) {
    const modalRef = this.modalService.open(AreaDeviceSelectDialogComponent, {
      areaId: this.areaId, projectId: this.projectId
    });
    modalRef.onClosed
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(ad => {
      this.logger.debug('onMapDeviceAddClick onclose modal', ad);
      if (ad) {
        this.loadingStatus = LoadingStatusEnum.Saving;
        this.areaService.addAreaDevice(this.areaId, {
          device: ad.device,
          mapInfo: {
            icon: ad.icon,
            x: 0.5,
            y: 0.5
          }
        } as AreaDevice)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((areaDevice: AreaDevice) => {
          this.logger.debug('onMapDeviceAddClick add area device', areaDevice);
          this.apiSuccess(areaDevice);
          this.mapComponent.addAreaItem(areaDevice);
        }, (err) => {
          this.logger.error('onMapDeviceAddClick add area device Error', err)
          this.apiError(err);
        });
      }
    });
  }

  /**
   * Removing a device to the area map
   * @param areaDevice
   */
  onMapDeviceRemoved(areaDevice: AreaDevice) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.removeAreaDevice(this.areaId, areaDevice.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.logger.debug('onMapDeviceRemoved remove area device', res);
        this.apiSuccess(res);
      }, (err) => {
        this.logger.error('onMapDeviceRemoved remove area device Error', err);
        this.apiError(err);
      });
  }

  /**
   * Updating a device to the area map
   * @param areaDevice
   */
  onMapDeviceUpdated(areaDevice: AreaDevice) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.removeAreaDevice(this.areaId, areaDevice.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
      this.logger.debug('onMapDeviceUpdated remove area device', res);
      areaDevice.id = 0;
      // NOTE: 'areaDevice.device.project.user.screenName' property
      //       causes error on the microservices side, so the property
      //       is deleted before updating
      delete areaDevice.device.project.user;
      this.areaService.addAreaDevice(this.areaId, areaDevice)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((ad) => {
        this.logger.debug('onMapDeviceUpdated add area device', ad);
        Object.assign(areaDevice, ad);
        this.apiSuccess(ad);
      }, (err) => {
        this.logger.error('onMapDeviceUpdated add area device Error', err);
        this.apiError(err);
      });
    }, (err) => {
      this.logger.error('onMapDeviceUpdated remove area device Error', err);
      this.apiError(err);
    });
  }

  /**
   * Management of the click on the button to add a sub-area
   * @param e
   */
  onMapAreaAddClick(e) {
    const modalRef = this.modalService.open(AreaInnerareaSelectDialogComponent, {
      areaId: this.areaId, projectId: this.projectId, areas: this.areaList
    });
    modalRef.onClosed
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(a => {
      this.logger.debug('onMapAreaAddClick modal on close', a);
      if (a) {
        a.mapInfo = {
          icon: 'map.png',
          x: 0.5,
          y: 0.5
        };
        this.loadingStatus = LoadingStatusEnum.Saving;
        this.areaService.updateArea(this.patchArea(a))
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(area => {
          this.logger.debug('onMapAreaAddClick update area', area);
          Object.assign(a, area);
          this.mapComponent.addAreaItem(a);
          this.apiSuccess(area);
        }, (err) => {
          this.logger.error('onMapAreaAddClick update area Error', err);
          this.apiError(err)
        });
      }
    });
  }

  /**
   * Removing a sub-area from the area map
   * @param area
   */
  onMapAreaRemoved(area: Area) {
    area.mapInfo = null;
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.updateArea(this.patchArea(area))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        this.logger.debug('onMapAreaRemoved update area', area);
        this.apiSuccess(res);
        // update areaList item
        const areaIndex = this.areaList.indexOf(this.areaList.find(a => a.id === area.id));
        if (areaIndex !== -1) {
          Object.assign(this.areaList[areaIndex], area);
        }
      }, (err) => {
        this.logger.error('onMapAreaRemoved update area Error', err);
        this.apiError(err);
      });
  }

  /**
   * Updating a sub-area from the area map
   * @param area
   */
  onMapAreaUpdated(area: Area) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.areaService.updateArea(this.patchArea(area))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.logger.debug('onMapAreaUpdated update area', area);
        this.apiSuccess(res);
      }, (err) => {
        this.logger.error('onMapAreaUpdated update area Error', err);
        this.apiError(err);
      });
  }

  /**
   * Management of the click on an area in the list of project areas
   * @param area
   */
  onEditAreaClick(area) {
    this.logger.debug('onEditAreaClick start', area);
    this.currentSection = 0; // show the info tab
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', area.id ] } } ]
    );
  }

  /**
   * Management of the click on a sub-area in the parent area
   * @param area
   */
  onEditInnerAreaClick(area) {
    this.logger.debug('onEditInnerAreaClick start', area);
    this.currentSection = 0; // show the info tab
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', area.id ] } } ]
    );
  }

  /**
   * Adding a sub-area
   * @param e
   */
  onAddInnerAreaClick(e) {
    this.logger.debug('onAddInnerAreaClick start', e);
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', 0] } } ],
      { queryParams: { parent: this.areaId } }
    );
  }

  /**
   * Listener set on the click of the area creation/modification tabs
   * @param e
   */
  onTabChange(e) {
    if (this.currentSection === 0) {
      this.showSave = true;
      this.hideDelete = this.areaId ? false : true;
      this.clickedTab.emit('Tab-Info');
      this.logger.debug('onTabChange Tab-Info', e);
    } else {
      this.showSave = false;
      this.showCancel = false;
      this.hideDelete = true;
    }

    if(this.currentSection === 1){
      this.clickedTab.emit('Tab-Sub-Area');
      this.logger.debug('onTabChange Tab-Sub-Area', e);
    }

    if (this.currentSection === 2) {
      this.loadAreaData();
      this.clickedTab.emit('Tab-Map');
      this.logger.debug('onTabChange Tab-Map', e);
    }

  }

  /**
   * Counting the sub-areas of an area
   * @param area
   * @private
   */
  private countAreaItems(area: Area) {
    this.areaService.findInnerAreas(area.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((areaTree) => {
      this.logger.debug('countAreaItems find inner areas', areaTree);
      const count = (list: Area[]): number => {
        let sum = list.length;
        list.forEach((a) => { sum += count(a.innerArea); });
        return sum;
      };
      area['innerCount'] = count(areaTree.innerArea);
      // get all devices (including inner areas ones)
      this.areaService.getAreaDeviceDeepList(area.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((deviceList) => {
        area['deviceCount'] = deviceList.length;
      });
    });
  }

  /**
   * Loading a map of the area with all its elements
   * @private
   */
  private loadAreaMap() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.getAreaDeviceList(this.areaId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((areaDevices: AreaDevice[]) => {
      this.logger.debug('loadAreaMap get area devices list', areaDevices);
      this.mapComponent.setAreaItems(areaDevices.concat(this.areaList.filter(a => a.mapInfo != null)));
      this.mapComponent.refresh();
      this.loadingStatus = LoadingStatusEnum.Ready;
    });
    if (this.mapComponent.itemOpen.observers.length === 0) {
      this.mapComponent.itemOpen
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((openItem) => {
        this.logger.debug('loadAreaMap item open', openItem);
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
      this.mapComponent.itemRemove
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((removedItem) => {
        this.logger.debug('loadAreaMap item removed', removedItem);
        if (removedItem.device) { // item is a device
          this.onMapDeviceRemoved(removedItem);
        } else { // item is an area
          this.onMapAreaRemoved(removedItem);
        }
      });
    }
    if (this.mapComponent.itemUpdate.observers.length === 0) {
      this.mapComponent.itemUpdate
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((updatedItem) => {
        this.logger.debug('loadAreaMap item updated', updatedItem);
        if (updatedItem.device) { // item is a device
          this.onMapDeviceUpdated(updatedItem);
        } else { // item is an area
          this.onMapAreaUpdated(updatedItem);
        }
      });
    }
    if (this.mapComponent.renderDataRequest.observers.length === 0) {
      this.mapComponent.renderDataRequest
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((draggableItem: DraggableItemComponent) => {
        this.logger.debug('loadAreaMap render data request', draggableItem);
        if (!draggableItem.itemData.device) { // item is an Area
          const a = this.areaList.find((area) => area === draggableItem.itemData) as any;
          draggableItem.renderData.deviceCount = a.deviceCount;
        }
      });
    }
    this.loadAreaImage();
  }

  /**
   * Loading an image of an area
   * @private
   */
  private loadAreaImage() {
    this.logger.debug('loadAreaImage function start');
    this.mapComponent.unsetMapImage();
    this.mapComponent.setOverlayLevel(true, this.overlayLoadingString);
    const imageInfo = JSON.parse(this.entity.areaConfiguration);
    if (this.entity.areaViewType === 'IMAGE' && imageInfo) {
      // TODO: no way to make this work with Area API
      //this.areaService.getAreaImage(this.areaId).subscribe((res) => {
      //});
      // TODO: using standard HttpClient for this request
      this.httpClient.get(`/hyperiot/areas/${this.areaId}/image`, {
        responseType: 'blob'
      })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res: Blob) => {
          this.logger.debug('Get Area Image', res);
          const reader = new FileReader();
          reader.onload = () => {
            this.logger.debug('loadAreaImage Loading Image');
            const img = new Image();
            img.onload = () => {
              this.logger.debug('loadAreaImage image onload');
              this.mapComponent.setMapImage(`/hyperiot/areas/${this.areaId}/image?` + (new Date().getTime()), img.width, img.height);
            };
            img.src = reader.result as string;
          };
          reader.onloadend = () => {
            this.logger.debug('loadAreaImage image onloadend');
            this.mapComponent.setOverlayLevel(false, '');
          }
          reader.readAsDataURL(res);
      }, (err) => {
          this.logger.error('Error loading area media', err);
          this.mapComponent.setOverlayLevel(true, this.ovelayErrorString);
      });
    } else {
      this.logger.warn('No Media for this Area');
      this.mapComponent.setOverlayLevel(true, this.overlayEmptyString);
    }
  }

  /**
   * Get ID of parent Area
   * @private
   */
  private getParentAreaId() {
    this.logger.debug('getParentAreaId start');
    if (this.areaPath.length > 1) {
      return this.areaPath[this.areaPath.length - 2].id;
    }
  }

  /**
   * Reset of the basic parameters of an area type object
   * @param a
   * @private
   */
  private patchArea(a: Area): Area {
    this.logger.debug('patchArea', a);
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

  /**
   * Loading of the area elements
   * @private
   */
  private loadAreaData() {
    // Load inner areas
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.findInnerAreas(this.entity.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((areaTree) => {
        this.logger.debug('loadAreaData find inner areas', areaTree);
        this.areaList = areaTree.innerArea;
        this.areaList.forEach((a) => {
          this.countAreaItems(a);
        });
        this.apiSuccess(areaTree);
        if (this.currentSection === 2) {
          this.loadAreaMap();
        }
    },
(err) => {
        this.logger.error('loadAreaData Finding child areas failed', err);
        this.apiError(err);
      });
  }

  /**
   * Saving an area with the possibility of launching a callback function
   * @param successCallback
   * @param errorCallback
   * @private
   */
  private saveArea(successCallback: any, errorCallback: any) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    let area = this.entity;
    area.name = this.form.get('area-name').value;
    area.description = this.form.get('area-description').value;
    // TEST CONFIGURATION
    area = this.patchArea(area);
    const parentAreaId = this.getParentAreaId();
    area.parentArea = parentAreaId ? { id: parentAreaId, entityVersion: null } : null;
    if (area.id) {
      // Update existing
      this.areaService.updateArea(area)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res) => {
        this.logger.debug('saveArea update area', res);
        this.entity = res;
        this.resetForm();
        this.areaService.getAreaPath(res.id)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((path) => {
          this.logger.debug('saveArea get area path', path);
          this.areaPath = path;
        });
        this.apiSuccess(res);
        successCallback(res);
      }, (err) => {
        this.logger.error('saveArea update area', err);
        this.setErrors(err);
        errorCallback(err);
      });
    } else {
      // Add new
      this.areaService.saveArea(area)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res) => {
        this.logger.debug('saveArea saveArea', res);
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
        successCallback(res);
      }, (err) => {
        this.logger.error('saveArea save area Error', err);
        this.setErrors(err);
        errorCallback(err);
      });
    }
  }

  /**
   * Deleting an area with the possibility of launching a callback function
   * @param successCallback
   * @param errorCallback
   * @private
   */
  private deleteArea(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    const parentAreaId = this.getParentAreaId();
    this.areaService.deleteArea(this.areaId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
      this.logger.debug('deleteArea delete area', res);
      this.apiSuccess(res);
      successCallback(res);
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
      this.logger.error('deleteArea delete area Error', err);
      this.apiError(err);
      errorCallback(err);
    });
  }

  /**
   * Function to handle the success of an api call
   * @param res
   * @private
   */
  private apiSuccess(res) {
    this.logger.debug('apiSuccess result', res);
    this.loadingStatus = LoadingStatusEnum.Ready;
  }

  /**
   * Function to handle the error of an api call
   * @param err
   * @private
   */
  private apiError(err) {
    this.logger.error('apiError result', err);
    this.loadingStatus = LoadingStatusEnum.Error;
  }

}
