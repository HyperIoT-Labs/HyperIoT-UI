import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkDragEnd} from '@angular/cdk/drag-drop';
import {Area, AreaDevice, AreasService, Logger, LoggerService} from 'core';
import {PageStatus} from '../../../models/pageStatus';
import {AreaMapComponent} from '../../projects/project-forms/areas-form/area-map/area-map.component';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {DeviceActions, HytTreeViewProjectComponent, MapComponent} from 'components';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MapTypeKey} from "../../../../../projects/components/src/lib/hyt-map/models/map-type-key";

@Component({
  selector: 'hyt-container-area-map',
  templateUrl: './container-area-map.component.html',
  styleUrls: ['./container-area-map.component.scss']
})
export class ContainerAreaMapComponent implements OnInit, OnDestroy {
  /**
   * Hook to track the map element
   */
  @ViewChild('map')  mapComponent: any; //AreaMapComponent;
  /**
   * Hook to track the treeview element
   */
  @ViewChild('treeView', {static: false})  treeView: HytTreeViewProjectComponent;
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
  /**
   * Start position of draggable element
   */
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
  /**
   * Array containing project area objects
   */
  areaPath: Area[] = [];
  /**
   * Overlay loading status text
   */
  overlayLoadingString = $localize`:@@HYT_loading_area_media:Loading Area Media`;
  /**
   * Overlay error status text
   */
  ovelayErrorString = $localize`:@@HYT_loading_media_error:Loading Media Error`;
  /**
   * Overlay 'Empty Media' status text
   */
  overlayEmptyString = $localize`:@@HYT_no_area_media:No Media`;
  /**
   * Variable for managing the area treeview overlay
   */
  overlayTreeView = true;
  /**
   * Treeview overlay loading status text
   */
  overlayTreeViewLoading = $localize`:@@HYT_area_tree_loading:Loading Treeview`;
  /**
   * Treeview overlay error status text
   */
  overlayTreeViewError = $localize`:@@HYT_area_tree_error:Error Loading`;
  /**
   * Container of treeview overlay text
   */
  overlayTreeViewMsg = '';
  areaViewType: string;
  pathBim: string = '';
  isBimLoading: boolean = true;
  isEmptyBim: boolean = false;
  areaConfiguration: string;
  currentMapTypeKey: MapTypeKey = MapTypeKey.LEAFLET;
  /*
   * logger service
   */
  private logger: Logger;
  /**
   * Subject for manage the open subscriptions
   * @protected
   */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

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
    this.areaService.findArea(this.areaId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
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
  }

  ngOnDestroy() {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  /**
   * Set Treeview overlay status and message
   * @param value
   * @param msg
   */
  setOverlayTreeView(value: boolean, msg: string) {
    this.logger.debug('setOverlayTreeView start', value, msg);
    this.overlayTreeView = value;
    this.overlayTreeViewMsg = msg;
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
    this.logger.debug('dragEnded drag position', this.dragPosition);

  }
  /**
   * function used to toggle display treeview project in area map
   */
  toggleTreeViewProject() {
    this.logger.debug('toggleTreeViewProject start');
    this.treeViewIsOpen = !this.treeViewIsOpen;

    if(this.treeViewIsOpen) {

      this.preTitleTreeView = $localize`:@@HYT_areas_hide_treeview:Hide`;
      this.dragPosition = {x: this.basicDragPosition.x, y: this.basicDragPosition.y};

    } else {

      this.preTitleTreeView = $localize`:@@HYT_areas_show_treeview:Show`;

    }

  }

  /**
   * When you click on an element of the treeview, it loads the relative area
   * @param node
   */
  onTreeNodeClick(node) {
    this.logger.debug('onTreeNodeClick start', node);
    if(node.data.item.id !== this.areaId){
      this.router.navigate(['areas', this.projectId, node.data.item.id])
        .then(() => {
          //TODO: Change method to navigate
          this.loadArea(node.data.item);
        })
    }
  }

  /**
   * Load the area with its related elements
   * @param area
   * @private
   */
  private loadArea(area: Area) {
    this.areaId = area.id;
    this.areaName = area.name;
    this.areaViewType = area.areaViewType;
    this.areaConfiguration = area.areaConfiguration;
    // populate area treeview
    this.configureAreaTree(this.areaId, false);
    // load area map items
    this.pageStatus = PageStatus.Loading;
    this.areaService.findInnerAreas(this.areaId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(areaTree => {
        this.logger.debug('loadArea find inner area', areaTree);
        this.areaList = areaTree.innerArea;
        this.areaService.getAreaDeviceList(this.areaId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
          {
            next: (areaDevices: AreaDevice[]) => {
              if(area.areaViewType === 'IMAGE' || area.areaViewType === 'MAP'){
                this.logger.debug('Found the devices present in this area', areaDevices);
                this.areaDevices = areaDevices;
                this.mapComponent.setAreaItems(areaDevices.concat(this.areaList.filter(a => a.mapInfo != null)));
                this.mapComponent.refresh();
                this.loadAreaImage(areaTree);
              }
              if(area.areaViewType === 'BIM_XKT'){
                this.logger.debug('Found the devices present in this area', areaDevices);
                this.areaDevices = areaDevices;
                this.loadAreaBim(areaTree);
              }

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

  /**
   * Load area image
   * @param area
   * @private
   */
  private loadAreaImage(area: Area) {
    // load area map image
    this.mapComponent.unsetMapImage();
    this.mapComponent.setOverlayLevel(true, this.overlayLoadingString);

    if (area.areaViewType === 'IMAGE' && area.areaConfiguration) {
      // TODO: no way to make this work with Area API
      /*this.areaService.getAreaImage(this.areaId).subscribe((res) => {
         RESULT
       },
         (err) => {
           ERROR
      });*/
      // TODO: using standard HttpClient for this request
      this.httpClient.get(`/hyperiot/areas/${this.areaId}/image`, {
        responseType: 'blob'
      })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
        {
          next: (res: Blob) => {
            this.logger.debug('Get image of the area', res);
            const reader = new FileReader();
            reader.onload = () => {
              const img = new Image();
              img.onload = () => {
                this.mapComponent.setMapImage(`/hyperiot/areas/${this.areaId}/image?` + (new Date().getTime()), img.width, img.height);
              };
              img.src = reader.result as string;
            };
            reader.onloadend = () => {
              this.mapComponent.setOverlayLevel(false, '');
            }
            reader.readAsDataURL(res);
            this.logger.debug('Found matching image for this area: '+this.areaId, res);
          },
          error: (error) => {
            this.mapComponent.setOverlayLevel(true, this.ovelayErrorString);
            this.logger.error('No images found for this area: '+this.areaId, error);
          }
        })
    } else {
      this.logger.warn('No Image set...', area.areaConfiguration);
      this.mapComponent.setOverlayLevel(true, this.overlayEmptyString);
    }


  }

  private loadAreaBim(area: Area){
    this.logger.debug('loadAreaBim function start');
    this.isBimLoading = true;
    this.isEmptyBim = false;

    if (area.areaViewType === 'BIM_XKT' && area.areaConfiguration) {
      this.isEmptyBim = false;
      this.httpClient.get(`/hyperiot/areas/${this.areaId}/image`, {
        responseType: 'blob'
      })
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res: Blob) => {
            this.logger.debug('Get Area Bim File', res);
            this.pathBim = `/hyperiot/areas/${this.areaId}/image`;
            this.isBimLoading = false;
          },
          error: (error) => {
            this.logger.error('Get Area Bim File ERROR', error);
            this.isBimLoading = false;
          }
        })
    } else {
      this.isEmptyBim = true;
      this.logger.warn('%cBIM WARNING isEmptyBim', this.isEmptyBim);
      this.logger.warn('%cBIM WARNING isBimLoading', this.isBimLoading);
      this.logger.warn('No configuration data for this area');
    }
  }

  /**
   * Action relative to the click of the edit button
   */
  onEditButtonClick() {
    this.logger.debug('onEditButtonClick start');
    // open areas editor
    this.router.navigate(
      [ '/projects/', this.projectId, {outlets: { projectDetails: ['areas', this.areaId ] } } ]
    );
  }

  /**
   * Management of the click on the elements present in the area map
   * @param itemMap
   */
  public onItemMapClicked(itemMap){
    this.logger.debug('onItemMapClicked start', itemMap);
    if (itemMap.deviceAction) {
      if (itemMap.deviceAction === DeviceActions.DASHBOARD) {
        this.logger.debug('navigation to device dashboard', itemMap.item);
        if (itemMap.item.device) {
          this.router.navigate(['hdevice', this.projectId, itemMap.item.device.id, 'dashboards'])
        } else{
          this.logger.error('Device not found', itemMap.item);
        }
      } else if (itemMap.deviceAction === DeviceActions.ALARMMANAGER) {
        // TODO implement navigation to alarmmanager
        this.logger.debug('navigation to alarmmanager', itemMap);
      }
    }
    else if(itemMap.innerArea){
      this.router.navigate(['areas', this.projectId, itemMap.id])
        .then(() => {
          //TODO: Change method to navigate
          this.loadArea(itemMap);
        })
    }
  }

  /**
   * Configure Area Map Tree
   * @param areaId
   * @param showDevices
   * @private
   */
  private configureAreaTree(areaId: number, showDevices: boolean) {
    this.setOverlayTreeView(true, this.overlayTreeViewLoading);
    // load areas tree
    this.areaService.getAreaPath(areaId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((areaPath: Area[]) => {
        this.logger.debug('Get area path', areaPath);
        this.areaPath = areaPath;
        areaId = areaPath[0].id; // root area
        this.areaService.findInnerAreas(areaId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe((areaTree) => {
            this.logger.debug('Find inner area', areaTree);
          // get all devices (including inner areas ones)
          this.areaService.getAreaDeviceDeepList(areaId)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((deviceList) => {
              this.logger.debug('Get device list', deviceList);
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
            if(config){
              this.logger.debug('buildTreeConfig', config);
              this.treeView.setData(config);
              this.treeView.treeControl.expand(this.treeView.treeControl.dataNodes[0]);
              const foundActiveNode = this.treeView.treeControl.dataNodes.find(el => el.data.item.name === this.areaName);
              const currentActiveNode = (foundActiveNode) ? foundActiveNode : this.treeView.treeControl.dataNodes[0];
              this.treeView.setActiveNode(currentActiveNode);
              this.setOverlayTreeView(false, '');
            } else {
              this.logger.error('Error configuring the areas treeview', config);
              this.setOverlayTreeView(true, this.overlayTreeViewError);
            }
          });
        });
      }, (err) => {
        this.setOverlayTreeView(true, this.overlayTreeViewError);
        this.logger.error('Get Area Path Error', err);
      });
  }

}
