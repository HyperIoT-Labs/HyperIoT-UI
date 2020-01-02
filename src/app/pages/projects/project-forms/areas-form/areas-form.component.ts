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
    }
  };

  projectId: number;
  areaId = 0;
  areaList: Area[];

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
  }

  ngOnInit() {
    this.load();
  }

  public load() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    if (this.areaId > 0) {
      this.areaService.findArea(this.areaId).subscribe((area) => {
        this.edit(area);
        this.loadingStatus = LoadingStatusEnum.Ready;
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
}
