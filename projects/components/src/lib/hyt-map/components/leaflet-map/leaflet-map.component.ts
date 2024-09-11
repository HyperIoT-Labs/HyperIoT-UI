import {Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {latLng, tileLayer} from "leaflet";
import * as L from 'leaflet';
import {Logger, LoggerService} from "core";
import {LeafletMap} from "../../models/leaflet-map";

@Component({
  selector: 'hyt-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.scss']
})
export class LeafletMapComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Variable used to understand when we are in the "EDIT" mode of the map
   */
  @Input() editMode: boolean = false;
  /**
   * Variable used to set the center of the map
   */
  @Input() option: LeafletMap;
  /**
   * Default options to set the map in case of no user selected data
   */
  defaultOption: LeafletMap = {
    latitude: 44.495893197089124,
    longitude: 11.39296883458248,
    zoom: 15,
    minZoom: 6,
    maxZoom: 18
  }
  defaultLayer: L.TileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  });
  /*
  * logger service
  */
  private logger: Logger
  /**
   * Reference to map object
   * @private
   */
  private mapRef: L.Map;
  /**
   * Observer used to report changes in map container size
   * @private
   */
  private resizeMapObserver: ResizeObserver;
  /**
   * Object that contain the init params for the mao
   */
  mapOptions: L.MapOptions = {
    layers: [
      this.defaultLayer
    ],
    zoom: this.defaultOption.zoom,
    minZoom: this.defaultOption.minZoom,
    maxZoom: this.defaultOption.maxZoom,
    center: L.latLng({
      lat: this.defaultOption.latitude,
      lng: this.defaultOption.longitude
    })
  };

  constructor(
    private ngZone: NgZone,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('LeafletMapComponent');
    // Set First map option
    this.initDataMap(this.option);
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges) {
    console.log('NGONCHANGES', changes);
    if (changes['option'].currentValue !== changes['options']?.previousValue) {
      console.log('NGONCHANGES DIFFERENTE quindi initMap', changes['option'].currentValue);
      this.initDataMap(changes['option'].currentValue);
    }
  }

  ngOnDestroy() {
    if (this.resizeMapObserver && this.mapRef) {
      this.resizeMapObserver.unobserve(this.mapRef.getContainer());
    }
  }

  /**
   * Initialize Map data
   */
  initDataMap(option: LeafletMap) {
    if (option) {
      this.mapOptions = {
        layers: [
          this.defaultLayer
        ],
        zoom: this.option.zoom,
        minZoom: (this.option.minZoom) ? this.option.minZoom : this.defaultOption.minZoom,
        maxZoom: (this.option.maxZoom) ? this.option.maxZoom : this.defaultOption.maxZoom,
        center: L.latLng({
          lat: this.option.latitude,
          lng: this.option.longitude
        })
      }
    }
  }

  /**
   * Management of the map as soon as its data are available
   * @param map
   */
  onMapReady(map: L.Map): void {
    this.mapRef = map;

    // Region resize map management
    this.resizeMapObserver = new ResizeObserver(() => {
      this.ngZone.runOutsideAngular(() => {
        console.log('INVALIDATE SIZE');
        map.invalidateSize();
      });
    });

    this.resizeMapObserver.observe(map.getContainer());
    //#endregion

    L.control.scale().addTo(map);
  }

}
