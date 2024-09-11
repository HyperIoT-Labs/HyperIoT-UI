import {Component, Input, OnInit} from '@angular/core';
import {MapTypeKey} from "./models/map-type-key";
import {Logger, LoggerService} from "core";
import {LeafletMap} from "./models/leaflet-map";

@Component({
  selector: 'hyt-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  /**
   * Indication of the type of third-party library used for map display
   */
  @Input() mapType: MapTypeKey = MapTypeKey.LEAFLET;
  /**
   * Variable used to understand when we are in the "EDIT" mode of the map
   */
  @Input() editMode: boolean = false;
  /**
   * Variable used to understand when we are in the "EDIT" mode of the map
   */
  @Input() option: LeafletMap;
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

}
