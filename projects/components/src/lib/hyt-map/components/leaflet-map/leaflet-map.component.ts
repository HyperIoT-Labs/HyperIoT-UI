import {ChangeDetectorRef, Component, ComponentFactoryResolver, EventEmitter, Injector, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {latLng, tileLayer} from "leaflet";
import * as L from 'leaflet';
import {Area, AreaDevice, Logger, LoggerService} from "core";
import { LeafletMapConfig } from "../../models/leaflet-map";
import { MapDefaultConfiguration } from '../../map-configuration';
import { MapDeviceEditComponent } from '../map-device-edit/map-device-edit.component';

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

  _editCenter: boolean = false;

  @Input() areaConfiguration: string;

  private _mapMoveCB: (areaConfiguration: string) => void;

  itemOpen = new EventEmitter<any>();
  itemRemove = new EventEmitter<any>();
  itemUpdate = new EventEmitter<any>();

  centerMarker: L.Marker<any>;

  defaultLayer: L.TileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  });

  /**
   * This variable is used to filter out
   */
  supportChange: string

  /**
   * Object that contain the init params for the map
   */
  mapOptions: L.MapOptions = {
    layers: [
      this.defaultLayer,
    ],
    zoom: MapDefaultConfiguration.zoom,
    zoomControl: MapDefaultConfiguration.zoomControls,
    minZoom: MapDefaultConfiguration.minZoom,
    maxZoom: MapDefaultConfiguration.maxZoom,
    zoomAnimation: true, // setting zoom in setView not always working if zoomAnimation true
    center: L.latLng({
      lat: MapDefaultConfiguration.latitude,
      lng: MapDefaultConfiguration.longitude
    }),
  };

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

  constructor(
    private ngZone: NgZone,
    private loggerService: LoggerService,
    private cdr: ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('LeafletMapComponent');
    // Set First map option
    //this.initDataMap(this.option);
  }

  ngOnInit(): void {
    this.mapOptions.zoomControl = !this.editMode;

    // setting default areaConfiguration if not provided
    if (!this.areaConfiguration) {
      this.areaConfiguration = JSON.stringify({
        latitude: MapDefaultConfiguration.latitude,
        longitude: MapDefaultConfiguration.longitude,
        zoom: MapDefaultConfiguration.zoom,
      });
    }

    // setting map initial zoom and center
    const parsedOption: LeafletMapConfig = JSON.parse(this.areaConfiguration);
    this.mapOptions.zoom = parsedOption.zoom;
    this.mapOptions.center = L.latLng({
      lat: parsedOption.latitude,
      lng: parsedOption.longitude,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    //if (this.supportChange !== changes['areaConfiguration'].currentValue) {
      //console.log('LEAFLET CHANGE', changes);
      //this.resetDataMap();
    //}
  }

  ngOnDestroy() {
    if (this.resizeMapObserver && this.mapRef) {
      this.resizeMapObserver.unobserve(this.mapRef.getContainer());
    }
  }

  /**
   * Reset area position based on areaConfiguration value
   * @param areaCfg ovserwrite areaconfiguration
   * @param cb optional callback to be executed after move end
   */
  resetDataMap(areaCfg?: string, cb?: Function) {
    if (this.mapRef) {
      if (areaCfg) {
        this.areaConfiguration = areaCfg;
      }
      const parsedOption: LeafletMapConfig = JSON.parse(this.areaConfiguration);

      if (cb) {
        if (this.mapRef.getCenter().equals(L.latLng(parsedOption.latitude, parsedOption.longitude ))) {
          cb();
        } else {
          this.mapRef.on('moveend', () => {
            cb();
            this.mapRef.off('moveend');
          });
        }
      }
      
      this.mapRef.setView(L.latLng({
        lat: parsedOption.latitude || MapDefaultConfiguration.latitude,
        lng: parsedOption.longitude || MapDefaultConfiguration.longitude,
      }), parsedOption.zoom || MapDefaultConfiguration.zoom);
    }
  }

  /**
   * Management of the map as soon as its data are available
   * @param map
   */
  onMapReady(map: L.Map): void {
    if (this.editMode) {
      this.centerMarker = L.marker(map.getCenter(), {
        icon: L.icon({
          iconUrl: 'assets/icons/map/marker-icon-red.png',
          shadowUrl: 'assets/icons/map/marker-shadow.png'
        }),
      }).addTo(map);
    }

    this.mapRef = map;

    // disable overlay input events
    var userOverlay = L.DomUtil.get('leaflet-user-overlay');
    L.DomEvent.disableClickPropagation(userOverlay);
    L.DomEvent.on(userOverlay, 'mousewheel', L.DomEvent.stopPropagation);
    L.DomEvent.on(userOverlay, 'click', L.DomEvent.stopPropagation);

    // Region resize map management
    this.resizeMapObserver = new ResizeObserver(() => {
      this.ngZone.runOutsideAngular(() => {
        //console.log('INVALIDATE SIZE');
        map.invalidateSize();
      });
    });

    this.resizeMapObserver.observe(map.getContainer());
    //#endregion

    L.control.scale().addTo(map);
  }

  ngAfterViewChecked() {
    // fix ExpressionChangedAfterItHasBeenCheckedError after mapMove() called
/*     if (this._areaConfiguration) {
      this.cdr.detectChanges();
    } */
  }
  
  mapMove(event) { // move and zoom events
    if (this._editCenter) {
      this.areaConfiguration = JSON.stringify({ latitude: this.mapRef.getCenter().lat, longitude: this.mapRef.getCenter().lng, zoom: this.mapRef.getZoom() });
      if (this.centerMarker) {
        this.centerMarker.setLatLng(this.mapRef.getCenter());
      }
    }
    if (this._mapMoveCB) {
      this._mapMoveCB(this.areaConfiguration);
    }
  }
  
  getAreaCenter() {
    return { x: this.mapRef.getCenter().lat, y: this.mapRef.getCenter().lng };
  }

  areaItemsCount = 0;
  addAreaItem(areaItem: AreaDevice | Area) {
    this.areaItemsCount++;
    this.logger.debug('addAreaItem function');
    const icon = L.icon({ 
      iconUrl: 'assets/icons/map/marker-icon.png', // + areaItem.mapInfo.icon,
      shadowUrl: 'assets/icons/map/marker-shadow.png' 
    });
    const marker = L.marker(L.latLng(areaItem.mapInfo.x, areaItem.mapInfo.y), { icon: icon });
    /* var popup = L.popup()
    .setContent('<p>Hello world!<br />This is a nice popup.</p>'); */

    if (this.editMode) {
      const deviceEditComponent = this.resolver.resolveComponentFactory(MapDeviceEditComponent).create(this.injector);
      deviceEditComponent.instance.deviceInfo = areaItem;
      deviceEditComponent.instance.itemRemoveCB = (deviceInfo) => {
        this.itemRemove.emit(deviceInfo);
        marker.remove();
        this.areaItemsCount--;
      };
      deviceEditComponent.instance.dragToggleCB = (dragEnable) => {
        if (dragEnable) {
          marker.dragging.enable();
        } else {
          marker.dragging.disable();
        }
      };
      deviceEditComponent.instance.subAreaOpenCB = (deviceInfo) => {
        this.itemOpen.emit(deviceInfo);
      }
      deviceEditComponent.changeDetectorRef.detectChanges();
  
      marker.bindPopup(deviceEditComponent.location.nativeElement).addTo(this.mapRef);
      marker.on('dragend', event => {
        const latlng = marker.getLatLng();
        areaItem.mapInfo.x = latlng.lat;
        areaItem.mapInfo.y = latlng.lng;
        this.itemUpdate.emit(areaItem);
      });
  
      L.DomEvent.disableClickPropagation(deviceEditComponent.location.nativeElement);
    }

    /* const divIcon = L.divIcon({ html: '<div style="color:red;font-size: 2rem">CIAO</div>' })
    L.marker(L.latLng(areaItem.mapInfo.x, areaItem.mapInfo.y), { icon: divIcon }).addTo(this.mapRef); */
  }

  setAreaItems(items: (AreaDevice | Area)[]) {
    this.logger.debug('setAreaItems function');
    // this.reset();
    items.forEach((d) => {
      this.addAreaItem(d);
    });
  }

  refresh() { }

  toggleEditCenter(isEditCenterEnabled: boolean, moveCB: (areaConfiguration: string) => void, areaConfiguration?: string) {
    if (isEditCenterEnabled) {
      this.resetDataMap(areaConfiguration, () => {
        this._editCenter = isEditCenterEnabled;
        this._mapMoveCB = moveCB;
      });
    } else {
      this._mapMoveCB = moveCB;
      this.resetDataMap(areaConfiguration, () => {
        this._editCenter = isEditCenterEnabled;
      });
    }
  }

  setMapCenter(areaConfiguration: string) {
    const tempCB = this._mapMoveCB;
    this._mapMoveCB = null;
    this.resetDataMap(areaConfiguration, () => { this._mapMoveCB = tempCB });
  }

  recenter() {
    this.resetDataMap();
  }

}
