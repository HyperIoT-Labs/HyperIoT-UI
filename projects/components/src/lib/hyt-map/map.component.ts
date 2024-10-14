import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {MapTypeKey} from "./models/map-type-key";
import {Area, AreaDevice, Logger, LoggerService} from "core";

@Component({
  selector: 'hyt-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild('map') mapComponent: any;

  /**
   * Indication of the type of third-party library used for map display
   */
  @Input() mapType: MapTypeKey = MapTypeKey.LEAFLET;
  /**
   * Variable used to understand when we are in the "EDIT" mode of the map
   */
  @Input() editMode: boolean = false;

  /**
   * Variable used to store map settings
   */
  @Input() areaConfiguration: string;

  @Output() itemOpen = new EventEmitter<any>();
  itemRemove = new EventEmitter<any>();
  itemUpdate = new EventEmitter<any>();
  renderDataRequest = new EventEmitter<any>();

  /*
  * logger service
  */
  private logger: Logger;

  constructor(private loggerService: LoggerService) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('MapComponent');
  }

  ngOnInit(): void {
    this.logger.info('Created map! Map Type: ' + this.mapType + ' - Edit mode: ' + this.editMode);
  }

  ngAfterViewInit() {
    this.mapComponent.itemOpen.subscribe(res => this.itemOpen.emit(res));
    this.mapComponent.itemRemove.subscribe(res => this.itemRemove.emit(res));
    this.mapComponent.itemUpdate.subscribe(res => this.itemUpdate.emit(res));
  }

  initArea(options: any) {
    this.mapComponent.initDataMap(options);
  }

  getAreaConfiguration() {
    return this.mapComponent.areaConfiguration;
  }

  getAreaCenter() {
    return this.mapComponent.getAreaCenter();
  }

  addAreaItem(areaItem: AreaDevice | Area) {
    this.logger.debug('addAreaItem function');
    this.mapComponent.addAreaItem(areaItem);
  }

  setAreaItems(items: (AreaDevice | Area)[]) {
    this.mapComponent.setAreaItems(items);
  }

  refresh() { }

  toggleEditCenter(isEditCenterEnabled: boolean, moveCB: (areaConfiguration: string) => void, areaConfiguration?: string) {
    this.mapComponent.toggleEditCenter(isEditCenterEnabled, moveCB, areaConfiguration);
  }

  setMapCenter(areaConfiguration: string) {
    this.mapComponent.setMapCenter(areaConfiguration);
  }

  getAreaItemCount() {
    return this.mapComponent?.areaItemsCount;
  }

  getImage() {
    return this.mapComponent.getImage();
  }

}
