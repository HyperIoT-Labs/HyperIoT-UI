import { Component, OnInit, ViewChild, ElementRef, Injector } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { Router, ActivatedRoute } from '@angular/router';
import { HytModalService } from '@hyperiot/components';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { AreasService, HprojectsService, Area } from '@hyperiot/core';

@Component({
  selector: 'hyt-areas-form',
  templateUrl: './areas-form.component.html',
  styleUrls: ['./areas-form.component.scss']
})
export class AreasFormComponent extends ProjectFormEntity implements OnInit {
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
  areaList: Area[] = [];

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
    this.areaId = this.activatedRoute.snapshot.params.areaId;
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
      // TODO: load new data if id changed
      this.areaId = params.areaId;
      this.load();
    });
  }

  ngOnInit() {
    this.load();
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
    }
    a['project'] = { id: this.projectId };
    this.areaService.saveArea(a).subscribe(res => {
      console.log(res);
    });
  }

  public load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    if (this.areaId > 0) {
      this.areaService.findArea(this.areaId).subscribe((area) => {
        this.edit(area);
        this.loadingStatus = LoadingStatusEnum.Ready;
        // TODO: load sub-areas
        this.areaService.findInnerAreas(area.id).subscribe((areaTree) => {
          this.areaList = areaTree.innerArea;
          console.log(this.areaList);
        });
      });
      this.showSave = true;
      this.hideDelete = false;
    } else {
      this.projectService.getHProjectAreaList(this.projectId).subscribe((list) => {
        this.areaList = list;
        this.loadingStatus = LoadingStatusEnum.Ready;
      });
      this.showSave = false;
      this.hideDelete = true;
    }
  }

  public save(successCallback: any, errorCallback: any) {
    console.log(this.form);
    this.saveArea(successCallback, errorCallback);
  }

  private saveArea(successCallback: any, errorCallback: any) {
    const area = this.entity;
    area.name = this.form.get('area-name').value;
    area.description = this.form.get('area-description').value;
    // TODO: the field project should be exposed in model
    // TODO: without this like the service will return validation error
    area['project'] = { id: this.projectId };
console.log(area);
    if (area.id) {
      this.areaService.updateArea(area).subscribe((res) => {
        this.entity = res;
        this.resetForm();
console.log(res);
      });
    } else {
      // TODO: this.areaService.saveArea(...)
    }
  }
}
