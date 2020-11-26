import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { HytTreeViewProjectComponent } from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AreasService, Area, AreaDevice, HprojectsService, HProject } from '@hyperiot/core';
import { HytModalService } from '@hyperiot/components';
import { AreaMapComponent } from '../../projects/project-forms/areas-form/area-map/area-map.component';
import { HttpClient } from '@angular/common/http';
import { ignoreElements } from 'rxjs/operators';

enum PageStatus {
  Loading = 0,
  Ready = 1,
  Error = -1
}

@Component({
  selector: 'hyt-areas-view',
  templateUrl: './areas-view.component.html',
  styleUrls: ['./areas-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AreasViewComponent {

  @ViewChild('map')
  mapComponent: AreaMapComponent;
  @ViewChild('treeView')
  treeView: HytTreeViewProjectComponent;

  PageStatus = PageStatus;
  pageStatus: PageStatus;

  userProjectsOptions: any[];
  selectedProjectOption: number;
  projectId: number;
  areaId: number;
  areaName: string;
  areaList: Area[] = [];
  areaDevices = [] as AreaDevice[];
  areaPath: Area[] = [];

  treeViewIsOpen: boolean = false;
  preTitleTreeView: string = 'Show'; /* @I18N@ */

  constructor(
    private projectService: HprojectsService,
    private areaService: AreasService,
    private modalService: HytModalService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = +this.activatedRoute.snapshot.params.projectId;
      this.areaId = +this.activatedRoute.snapshot.params.areaId;
      // load project data
      if (this.projectId) {
        this.selectedProjectOption = this.projectId;
        this.getAreasList();
      }
      this.loadProjectsList();
      // load area data
      if (this.areaId) {
        this.areaService.findArea(this.areaId).subscribe((area: Area) => {
          this.loadArea(area);
        }, this.apiError);
        // populate area treeview
        this.configureAreaTree(this.areaId, false);
      }
    });
  }

  onSelectedProjectChange(e) {
    this.areaId = 0; this.areaList = [];
    this.router.navigate(['/areas', e.value]);
  }

  onMainAreaClick(area: Area) {
    this.router.navigate(['/areas', this.projectId, area.id]);
  }

  onTreeNodeClick(node) {
    this.loadArea(node.data.item);
  }

  onEditButtonClick() {
    // open areas editor
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', this.areaId ] } } ]
    );
  }

  private loadProjectsList() {
    this.pageStatus = PageStatus.Loading;
    this.projectService.findAllHProject()
      .subscribe((projectList: HProject[]) => {
        // sort by date
        projectList.sort((a, b) => {
          if (a.entityModifyDate > b.entityModifyDate) { return -1; }
          if (a.entityModifyDate < b.entityModifyDate) { return 1; }
          return 0;
        });
        // select current project // TODO: this is not working =/ FIXME: !!!!
        if (!this.selectedProjectOption && projectList.length > 0) {
          this.projectId = this.selectedProjectOption = projectList[0].id;
          console.log("auto selecting first project", this.selectedProjectOption);

          // Load autoselected project areas
          this.areaId = 0; this.areaList = [];
          this.router.navigate(['/areas', this.projectId]);
        }
        // populate hyt-select options
        this.userProjectsOptions = [];
        projectList.forEach(p => this.userProjectsOptions.push({
          label: p.name,
          value: p.id
        }));
        this.apiSuccess(projectList);
      }, this.apiError);
  }

  public onItemMapClicked(itemMap){
    if(itemMap.innerArea){
      this.loadArea(itemMap);
    }
  }

  private loadArea(area: Area) {
    this.areaId = area.id;
    this.areaName = area.name;
    // load area map items
    this.pageStatus = PageStatus.Loading;
    this.areaService.findInnerAreas(this.areaId).subscribe(areaTree => {
      this.areaList = areaTree.innerArea;
      this.areaService.getAreaDeviceList(this.areaId).subscribe((areaDevices: AreaDevice[]) => {
        this.areaDevices = areaDevices;
        this.mapComponent.setAreaItems(areaDevices.concat(this.areaList.filter(a => a.mapInfo != null)));
        this.mapComponent.refresh();
        this.loadAreaImage(areaTree);
        this.apiSuccess(this.areaList);
      }, this.apiError);
    }, this.apiError);
  }

  private loadAreaImage(area: Area) {
    // load area map image
    this.mapComponent.unsetMapImage();
    if (area.imagePath) {
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

  private getAreasList() {
    this.pageStatus = PageStatus.Loading;
    this.projectService.getHProjectAreaList(this.projectId).subscribe((list: Area[]) => {
      this.areaList = list;
      list.forEach((a) => {
        this.countAreaItems(a);
      });
      this.apiSuccess(list);
    }, this.apiError);
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

  private configureAreaTree(areaId: number, showDevices: boolean) {
    // load areas tree
    this.areaService.getAreaPath(areaId).subscribe((areaPath: Area[]) => {
      this.areaPath = areaPath;
      areaId = areaPath[0].id; // root area
      this.areaService.findInnerAreas(areaId).subscribe((areaTree) => {
        // get all devices (including inner areas ones)
        this.areaService.getAreaDeviceDeepList(areaId).subscribe((deviceList) => {
          // add devices to areas tree
          const findArea = (areaList: Area[], id: number): Area => {
            let foundArea: Area;
            for (const a of areaList) {
              if (a.id === id) {
                foundArea = a;
              }
              if (!foundArea) {
                foundArea = findArea(a.innerArea, id);
              }
              if (foundArea) {
                return foundArea;
              }
            }
          };
          deviceList.forEach((ad) => {
            let deviceArea;
            if (areaTree.id === ad.area.id) {
              // found on root area
              deviceArea = areaTree;
            } else {
              // search on innerAreas
              deviceArea = findArea(areaTree.innerArea, ad.area.id);
            }
            if (deviceArea) {
              if (!deviceArea.deviceList) {
                deviceArea.deviceList = [];
              }
              deviceArea.deviceList.push(ad);
            }
          });
          // build treeview data structure from `areaTree`
          const buildTreeConfig = (areas) => {
            const treeConfig = [];
            areas.forEach((a) => {
              const treeArea = {
                data: { item: a, type: 'area' },
                name: a.name,
                icon: 'icon-hyt_areaB16',
                // add inner-areas
                children: buildTreeConfig(a.innerArea)
              };
              // add inner-areas and device count to area name
              if (treeArea.children.length > 0) {
                treeArea.name += ' A: ' + treeArea.children.length;
              }
              if (a.deviceList && a.deviceList.length > 0) {
                treeArea.name += ' D: ' + a.deviceList.length;
              }
              // add area devices
              if (showDevices && a.deviceList && a.deviceList.length > 0) {
                treeArea.children.push(...(a.deviceList.map((ad: AreaDevice) => {
                  const d = ad.device;
                  return {
                    data: {item: d, type: 'device'},
                    name: d.deviceName,
                    icon: 'icon-hyt_device',
                    children: []
                  };
                })));
                // add area devices count to area name
                if (a.deviceList.length > 0) {
                  treeArea.name += ' D: ' + a.deviceList.length;
                }
              }
              treeConfig.push(treeArea);
            });
            return treeConfig;
          };
          // build tree config
          const config = buildTreeConfig([areaTree]);
          this.treeView.setData(config);
          this.treeView.treeControl.expand(this.treeView.treeControl.dataNodes[0]);
          this.treeView.setActiveNode(this.treeView.treeControl.dataNodes[0]);
        });
      });
    });
  }

  apiSuccess(res) {
    this.pageStatus = PageStatus.Ready;
  }

  apiError(err) {
    console.log('API ERROR', err);
    this.pageStatus = PageStatus.Error;
  }

  toggleTreeViewProject() {

    this.treeViewIsOpen = !this.treeViewIsOpen;

    if(this.treeViewIsOpen) {
      
      this.preTitleTreeView = 'Hide'; /* @I18N@ */

    } else {

      this.preTitleTreeView = 'Show'; /* @I18N@ */

    }

  }

}
