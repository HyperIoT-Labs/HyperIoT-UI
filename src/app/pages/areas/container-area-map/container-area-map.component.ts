import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {Area, AreaDevice, AreasService, Logger, LoggerService} from '@hyperiot/core';
import {PageStatus} from '../../../models/pageStatus';
import {AreaMapComponent} from '../../projects/project-forms/areas-form/area-map/area-map.component';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {HytTreeViewProjectComponent} from '@hyperiot/components/lib/hyt-tree-view-project/hyt-tree-view-project.component';

@Component({
  selector: 'hyt-container-area-map',
  templateUrl: './container-area-map.component.html',
  styleUrls: ['./container-area-map.component.scss']
})
export class ContainerAreaMapComponent implements OnInit {
  /**
   * Hook to track the map element
   */
  @ViewChild('map')  mapComponent: AreaMapComponent;
  /**
   * Hook to track the treeview element
   */
  @ViewChild('treeView')  treeView: HytTreeViewProjectComponent;
  /***
   * ID of the current area
   */
  @Input() areaId: number;
  /***
   * ID of the current project
   */
  @Input() projectId: number;
  /**
   * variable used to determine if the treeview should be visible or not
   */
  treeViewIsOpen = false;
  /**
   * variable used to determine basic position of draggable treeview item
   */
  dragPosition = {x: 0, y: 0};
  basicDragPosition = {x: 0, y: 25};
  /**
   * variable used to dynamically set the first part of toggle treeview button title
   */
  preTitleTreeView = $localize`:@@HYT_areas_show_treeview:Show`;

  /**
   * Name of the area
   */
  areaName: string;
  /**
   * Current state of the Page
   */
  pageStatus: PageStatus = PageStatus.Ready;

  /**
   * List of the Areas
   */
  areaList: Area[] = [];
  /**
   * List of the Area's devices
   */
  areaDevices: AreaDevice[] = [];
  areaPath: Area[] = [];
  /*
   * logger service
   */
  private logger: Logger;

  constructor(
    private areaService: AreasService,
    private httpClient: HttpClient,
    private router: Router,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('ContainerAreaMapComponent');
  }

  ngOnInit(): void {
    this.areaService.findArea(this.areaId).subscribe({
        next: (area: Area) => {
          this.logger.debug('Found area corresponding to the searched ID: '+this.areaId, area);
          this.loadArea(area);
        },
        error: (error) => {
          this.logger.error('There is no area matching the ID you are looking for: '+this.areaId, error);
          this.pageStatus = PageStatus.Error
        }
      }
    );
    // populate area treeview
    this.configureAreaTree(this.areaId, false);
  }

  /**
   * Used to calculate the position in space and prevent the treeview from going out of bounds
   * @param ended // Object that contains all the information at the end of the drag action
   */
  dragEnded(ended: CdkDragEnd) {

    const constLeftX = 115; /* -115 after 0 point */

    // TREEVIEW DIV POSITION X/Y
    const posY = ended.source._dragRef['_activeTransform'].y;
    const posX = ended.source._dragRef['_activeTransform'].x;

    // TREEVIEW DIV MEASURES
    const ptW = ended.source.element.nativeElement.clientWidth + 15;

    // #HYT-CONTAINER LIMIT
    const hytContainerHClient = document.getElementById('hyt-container').clientWidth;

    // horizontal limit beyond which it is not possible to scroll the treeview box to the right
    const horizontalLimit = hytContainerHClient - constLeftX - ptW;

    let dragX: number;
    let dragY: number;

    // Verify Y position
    if(posY < -330){
      dragY = -330;
    }else{
      dragY = posY;
    }

    // Verify X position
    if(posX < -45){
      dragX = -50
    }else if(posX >= horizontalLimit){
      dragX = horizontalLimit - 20;
    }else{
      dragX = posX;
    }

    this.dragPosition = { x: dragX, y: dragY }

  }
  /**
   * function used to toggle display treeview project in area map
   */
  toggleTreeViewProject() {

    this.treeViewIsOpen = !this.treeViewIsOpen;

    if(this.treeViewIsOpen) {

      this.preTitleTreeView = $localize`:@@HYT_areas_hide_treeview:Hide`;
      this.dragPosition = {x: this.basicDragPosition.x, y: this.basicDragPosition.y};

    } else {

      this.preTitleTreeView = $localize`:@@HYT_areas_show_treeview:Show`;

    }

  }

  onTreeNodeClick(node) {
    this.loadArea(node.data.item);
  }

  private loadArea(area: Area) {
    this.areaId = area.id;
    this.areaName = area.name;
    // load area map items
    this.pageStatus = PageStatus.Loading;
    this.areaService.findInnerAreas(this.areaId).subscribe(areaTree => {
      this.areaList = areaTree.innerArea;
      this.areaService.getAreaDeviceList(this.areaId).subscribe(
        {
          next: (areaDevices: AreaDevice[]) => {
            this.logger.debug('Found the devices present in this area', areaDevices);
            this.areaDevices = areaDevices;
            this.mapComponent.setAreaItems(areaDevices.concat(this.areaList.filter(a => a.mapInfo != null)));
            this.mapComponent.refresh();
            this.loadAreaImage(areaTree);
          },
          error: (error) => {
            this.logger.error('Error while searching for devices for this area', error);
          }
        }
      );
      this.pageStatus = PageStatus.Ready
    }, // this.apiError
    );
  }

  private loadAreaImage(area: Area) {
    // load area map image
    console.log('ENTITY AREA', area);
    this.mapComponent.unsetMapImage();
    //if (area.imagePath) {
      // TODO: no way to make this work with Area API
      /*this.areaService.getAreaImage(this.areaId).subscribe((res) => {
         console.log('IMAGE', res);
       },
         (err) => {
           console.log('IMAGE ERR', err);
      });*/
      // TODO: using standard HttpClient for this request
      this.httpClient.get(`/hyperiot/areas/${this.areaId}/image`, {
        responseType: 'blob'
      }).subscribe(
        {
          next: (res: Blob) => {
            console.log('RES', res)
            const reader = new FileReader();
            reader.onload = () => {
              const img = new Image();
              img.onload = () => {
                this.mapComponent.setMapImage(`/hyperiot/areas/${this.areaId}/image?` + (new Date().getTime()), img.width, img.height);
              };
              img.src = reader.result as string;
            };
            reader.readAsDataURL(res);
            this.logger.debug('Found matching image for this area: '+this.areaId, res);
          },
          error: (error) => {
            this.logger.error('No images found for this area: '+this.areaId, error);
          }
        })
    /*} else {
      this.logger.warn('No Image Path Found...', area.imagePath);
    }*/
  }

  onEditButtonClick() {
    // open areas editor
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', this.areaId ] } } ]
    );
  }

  public onItemMapClicked(itemMap){
    if(itemMap.innerArea){
      this.loadArea(itemMap);
    }
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

}
