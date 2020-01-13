import { Component, OnInit, ViewChild, ElementRef, Injector } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Router, ActivatedRoute } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { AreasService, HprojectsService, Area } from '@hyperiot/core';
import { AreaMapComponent } from './area-map/area-map.component';

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
    private modalService: HytModalService
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
          this.loadInnerAreas();
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
    console.log('FILE CHANGED', event);
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.patchValue({
          imagePath: reader.result
        });
      };
    }
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
      console.log(this.mapComponent);
      this.mapComponent.refresh();
    }
  }

  private loadInnerAreas() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.areaService.findInnerAreas(this.entity.id).subscribe((areaTree) => {
      this.areaList = areaTree.innerArea;
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
